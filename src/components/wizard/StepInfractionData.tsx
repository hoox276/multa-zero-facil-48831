import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Upload, Loader2 } from "lucide-react";
import { WizardData } from "../Wizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StepInfractionDataProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepInfractionData({ data, updateData }: StepInfractionDataProps) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PDF, JPG ou PNG');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setUploadedFile(file);
    setExtracting(true);

    try {
      // Call edge function to extract data via GPT-5
      const { data: extractedData, error } = await supabase.functions.invoke('extract-ait', {
        body: { 
          fileName: file.name,
          fileType: file.type,
          fileData: await fileToBase64(file)
        }
      });

      if (error) throw error;

      if (extractedData) {
        updateData({
          numeroAuto: extractedData.numeroAuto || data.numeroAuto,
          dataInfracao: extractedData.dataInfracao || data.dataInfracao,
          dataCiencia: extractedData.dataCiencia || data.dataCiencia,
          orgaoAutuador: extractedData.orgaoAutuador || data.orgaoAutuador,
          localInfracao: extractedData.localInfracao || data.localInfracao,
          descricaoInfracao: extractedData.descricaoInfracao || data.descricaoInfracao,
          valorMulta: extractedData.valorMulta || data.valorMulta,
        });
        toast.success('Dados extraídos com sucesso! Revise e ajuste se necessário.');
      }
    } catch (error) {
      console.error('Erro ao extrair dados:', error);
      toast.error('Erro ao extrair dados. Preencha manualmente.');
    } finally {
      setExtracting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Calcular prazo restante
  const calcularPrazoRestante = () => {
    if (!data.dataCiencia) return null;
    
    const dataCiencia = new Date(data.dataCiencia);
    const prazoFinal = new Date(dataCiencia);
    prazoFinal.setDate(prazoFinal.getDate() + 30); // 30 dias para Defesa Prévia
    
    const hoje = new Date();
    const diasRestantes = Math.ceil((prazoFinal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    return { diasRestantes, prazoFinal };
  };

  const prazo = calcularPrazoRestante();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Dados da Infração</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload do Auto de Infração (AIT) para extração automática dos dados ou preencha manualmente.
        </p>
      </div>

      {/* Upload AIT */}
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p className="font-medium">Upload do Auto de Infração (AIT)</p>
            <p className="text-sm">
              Envie uma foto ou PDF do seu Auto de Infração para preenchimento automático via IA (GPT-5).
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById('ait-upload')?.click()}
                disabled={extracting}
                className="gap-2"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extraindo dados...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Escolher arquivo
                  </>
                )}
              </Button>
              {uploadedFile && (
                <span className="text-sm text-muted-foreground">
                  {uploadedFile.name}
                </span>
              )}
            </div>
            <input
              id="ait-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="numeroAuto">Número do Auto de Infração *</Label>
          <Input
            id="numeroAuto"
            value={data.numeroAuto}
            onChange={(e) => updateData({ numeroAuto: e.target.value })}
            placeholder="Ex: 1234567890"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInfracao">Data da Infração *</Label>
            <Input
              id="dataInfracao"
              type="date"
              value={data.dataInfracao}
              onChange={(e) => updateData({ dataInfracao: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataCiencia">
              Data da Ciência (Notificação) *
              <span className="text-xs text-muted-foreground ml-2">
                Importante para calcular prazo
              </span>
            </Label>
            <Input
              id="dataCiencia"
              type="date"
              value={data.dataCiencia}
              onChange={(e) => updateData({ dataCiencia: e.target.value })}
              required
            />
          </div>
        </div>

        {prazo && (
          <Alert variant={prazo.diasRestantes < 5 ? "destructive" : "default"}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {prazo.diasRestantes > 0 ? (
                <>
                  Você tem <strong>{prazo.diasRestantes} dias</strong> para protocolar a Defesa Prévia 
                  (até {prazo.prazoFinal.toLocaleDateString('pt-BR')})
                </>
              ) : (
                <>
                  <strong>Atenção:</strong> O prazo para Defesa Prévia expirou em {prazo.prazoFinal.toLocaleDateString('pt-BR')}. 
                  Você será redirecionado para gerar um recurso de JARI.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="orgaoAutuador">Órgão Autuador *</Label>
          <Input
            id="orgaoAutuador"
            value={data.orgaoAutuador}
            onChange={(e) => updateData({ orgaoAutuador: e.target.value })}
            placeholder="Ex: Detran-SP, CET, PRF"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="localInfracao">Local da Infração *</Label>
          <Input
            id="localInfracao"
            value={data.localInfracao}
            onChange={(e) => updateData({ localInfracao: e.target.value })}
            placeholder="Ex: Av. Paulista, altura do nº 1000 - São Paulo/SP"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricaoInfracao">Descrição da Infração *</Label>
          <Textarea
            id="descricaoInfracao"
            value={data.descricaoInfracao}
            onChange={(e) => updateData({ descricaoInfracao: e.target.value })}
            placeholder="Descreva a infração conforme consta no auto"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorMulta">Valor da Multa *</Label>
          <Input
            id="valorMulta"
            value={data.valorMulta}
            onChange={(e) => updateData({ valorMulta: e.target.value })}
            placeholder="R$ 0,00"
            required
          />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="pagouComDesconto"
                checked={data.pagouComDesconto}
                onCheckedChange={(checked) => 
                  updateData({ pagouComDesconto: checked as boolean })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="pagouComDesconto" className="cursor-pointer font-medium">
                  Já paguei a multa com desconto de 40% via SNE
                </Label>
                <p className="text-xs text-muted-foreground">
                  <strong>Importante:</strong> Em algumas jurisdições, o pagamento com desconto via Sistema de Notificação Eletrônica (SNE) 
                  pode impedir a interposição de defesa ou recurso. Marque esta opção se for o seu caso.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {data.pagouComDesconto && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Como você informou que pagou com desconto via SNE, verifique com o órgão autuador se ainda é possível 
              apresentar defesa. Em alguns casos, o pagamento implica em renúncia ao direito de defesa.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
