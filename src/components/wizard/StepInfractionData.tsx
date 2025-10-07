import { useState, useEffect } from "react";
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

interface ValidationErrors {
  numeroAuto?: string;
  dataInfracao?: string;
  dataCiencia?: string;
  localInfracao?: string;
  orgaoAutuador?: string;
  descricaoInfracao?: string;
  valorMulta?: string;
}

export function StepInfractionData({ data, updateData }: StepInfractionDataProps) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof ValidationErrors, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'numeroAuto':
        if (!value.trim()) {
          newErrors.numeroAuto = 'Número do auto é obrigatório';
        } else {
          delete newErrors.numeroAuto;
        }
        break;
        
      case 'dataInfracao':
        if (!value.trim()) {
          newErrors.dataInfracao = 'Data da infração é obrigatória';
        } else {
          delete newErrors.dataInfracao;
        }
        break;
        
      case 'dataCiencia':
        if (!value.trim()) {
          newErrors.dataCiencia = 'Data de ciência é obrigatória';
        } else {
          delete newErrors.dataCiencia;
        }
        break;
        
      case 'localInfracao':
        if (!value.trim()) {
          newErrors.localInfracao = 'Local da infração é obrigatório';
        } else if (value.trim().length < 10) {
          newErrors.localInfracao = 'Informe o local completo';
        } else {
          delete newErrors.localInfracao;
        }
        break;
        
      case 'orgaoAutuador':
        if (!value.trim()) {
          newErrors.orgaoAutuador = 'Órgão autuador é obrigatório';
        } else {
          delete newErrors.orgaoAutuador;
        }
        break;
        
      case 'descricaoInfracao':
        if (!value.trim()) {
          newErrors.descricaoInfracao = 'Descrição da infração é obrigatória';
        } else if (value.trim().length < 20) {
          newErrors.descricaoInfracao = 'Informe uma descrição mais detalhada';
        } else {
          delete newErrors.descricaoInfracao;
        }
        break;
        
      case 'valorMulta':
        if (!value.trim()) {
          newErrors.valorMulta = 'Valor da multa é obrigatório';
        } else {
          delete newErrors.valorMulta;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, data[field as keyof WizardData] as string);
  };

  const handleChange = (field: keyof ValidationErrors, value: string) => {
    updateData({ [field]: value });
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 &&
      data.numeroAuto.trim() &&
      data.dataInfracao.trim() &&
      data.dataCiencia.trim() &&
      data.localInfracao.trim() &&
      data.orgaoAutuador.trim() &&
      data.descricaoInfracao.trim() &&
      data.valorMulta.trim();
  };

  useEffect(() => {
    updateData({ _step2Valid: isFormValid() } as any);
  }, [data.numeroAuto, data.dataInfracao, data.dataCiencia, data.localInfracao, data.orgaoAutuador, data.descricaoInfracao, data.valorMulta, errors]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - Only images supported
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use apenas JPG ou PNG. Para PDFs, tire uma foto ou screenshot.');
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
      const base64Data = await fileToBase64(file);
      
      console.log('Calling extract-ait function with file:', file.name);
      
      // Call edge function to extract data
      const { data: extractedData, error } = await supabase.functions.invoke('extract-ait', {
        body: { 
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao processar arquivo');
      }

      if (extractedData && extractedData.error) {
        console.error('API returned error:', extractedData.error);
        throw new Error(extractedData.error);
      }

      if (extractedData) {
        console.log('Extracted data received:', extractedData);
        
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao extrair dados: ${errorMessage}. Preencha manualmente.`);
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
              Envie uma foto (JPG ou PNG) do seu Auto de Infração para preenchimento automático.
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
              accept=".jpg,.jpeg,.png"
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
            onChange={(e) => handleChange('numeroAuto', e.target.value)}
            onBlur={() => handleBlur('numeroAuto')}
            placeholder="Ex: 1234567890"
            className={touched.numeroAuto && errors.numeroAuto ? 'border-destructive' : ''}
            required
          />
          {touched.numeroAuto && errors.numeroAuto && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.numeroAuto}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInfracao">Data da Infração *</Label>
            <Input
              id="dataInfracao"
              type="date"
              value={data.dataInfracao}
              onChange={(e) => handleChange('dataInfracao', e.target.value)}
              onBlur={() => handleBlur('dataInfracao')}
              className={touched.dataInfracao && errors.dataInfracao ? 'border-destructive' : ''}
              required
            />
            {touched.dataInfracao && errors.dataInfracao && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.dataInfracao}
              </p>
            )}
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
              onChange={(e) => handleChange('dataCiencia', e.target.value)}
              onBlur={() => handleBlur('dataCiencia')}
              className={touched.dataCiencia && errors.dataCiencia ? 'border-destructive' : ''}
              required
            />
            {touched.dataCiencia && errors.dataCiencia && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.dataCiencia}
              </p>
            )}
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
            onChange={(e) => handleChange('orgaoAutuador', e.target.value)}
            onBlur={() => handleBlur('orgaoAutuador')}
            placeholder="Ex: Detran-SP, CET, PRF"
            className={touched.orgaoAutuador && errors.orgaoAutuador ? 'border-destructive' : ''}
            required
          />
          {touched.orgaoAutuador && errors.orgaoAutuador && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.orgaoAutuador}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="localInfracao">Local da Infração *</Label>
          <Input
            id="localInfracao"
            value={data.localInfracao}
            onChange={(e) => handleChange('localInfracao', e.target.value)}
            onBlur={() => handleBlur('localInfracao')}
            placeholder="Ex: Av. Paulista, altura do nº 1000 - São Paulo/SP"
            className={touched.localInfracao && errors.localInfracao ? 'border-destructive' : ''}
            required
          />
          {touched.localInfracao && errors.localInfracao && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.localInfracao}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricaoInfracao">Descrição da Infração *</Label>
          <Textarea
            id="descricaoInfracao"
            value={data.descricaoInfracao}
            onChange={(e) => handleChange('descricaoInfracao', e.target.value)}
            onBlur={() => handleBlur('descricaoInfracao')}
            placeholder="Descreva a infração conforme consta no auto"
            rows={4}
            className={touched.descricaoInfracao && errors.descricaoInfracao ? 'border-destructive' : ''}
            required
          />
          {touched.descricaoInfracao && errors.descricaoInfracao && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.descricaoInfracao}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorMulta">Valor da Multa *</Label>
          <Input
            id="valorMulta"
            value={data.valorMulta}
            onChange={(e) => handleChange('valorMulta', e.target.value)}
            onBlur={() => handleBlur('valorMulta')}
            placeholder="R$ 0,00"
            className={touched.valorMulta && errors.valorMulta ? 'border-destructive' : ''}
            required
          />
          {touched.valorMulta && errors.valorMulta && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.valorMulta}
            </p>
          )}
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

        {!isFormValid() && Object.values(touched).some(v => v) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Preencha todos os campos corretamente para continuar.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}