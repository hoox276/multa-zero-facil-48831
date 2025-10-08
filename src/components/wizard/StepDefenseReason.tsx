import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Sparkles, Loader2, Upload, FileText, X, AlertCircle } from "lucide-react";
import { WizardData } from "../Wizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StepDefenseReasonProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepDefenseReason({ data, updateData }: StepDefenseReasonProps) {
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [generatingLegal, setGeneratingLegal] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<File[]>([]);
  const [otherDocs, setOtherDocs] = useState<File[]>([]);

  const isFormValid = () => {
    return data.motivoDefesa.trim().length > 0;
  };

  useEffect(() => {
    updateData({ _step3Valid: isFormValid() } as any);
  }, [data.motivoDefesa]);

  const handleGenerateExplanation = async () => {
    if (!data.descricaoInfracao || !data.numeroAuto) {
      toast.error('Preencha os dados da infração primeiro');
      return;
    }

    setGeneratingExplanation(true);
    console.log('Generating defense explanation...');

    try {
      const { data: response, error } = await supabase.functions.invoke('generate-defense-explanation', {
        body: {
          numeroAuto: data.numeroAuto,
          dataInfracao: data.dataInfracao,
          localInfracao: data.localInfracao,
          descricaoInfracao: data.descricaoInfracao,
          orgaoAutuador: data.orgaoAutuador
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao gerar explicação');
      }

      if (response && response.error) {
        console.error('API returned error:', response.error);
        throw new Error(response.error);
      }

      if (response?.explanation) {
        console.log('Explanation generated successfully');
        updateData({ motivoDefesa: response.explanation });
        toast.success('Explicação gerada com sucesso!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro ao gerar explicação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao gerar explicação: ${errorMessage}`);
    } finally {
      setGeneratingExplanation(false);
    }
  };

  const handleGenerateLegalBasis = async () => {
    if (!data.motivoDefesa) {
      toast.error('Preencha a explicação dos fatos primeiro');
      return;
    }

    setGeneratingLegal(true);
    console.log('Generating legal basis...');

    try {
      const { data: response, error } = await supabase.functions.invoke('generate-legal-basis', {
        body: {
          motivoDefesa: data.motivoDefesa,
          descricaoInfracao: data.descricaoInfracao
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro ao gerar fundamentação');
      }

      if (response && response.error) {
        console.error('API returned error:', response.error);
        throw new Error(response.error);
      }

      if (response?.legalBasis) {
        console.log('Legal basis generated successfully');
        toast.success('Fundamentação legal gerada!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro ao gerar fundamentação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao gerar fundamentação: ${errorMessage}`);
    } finally {
      setGeneratingLegal(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Fatos e Fundamentos</h3>
        <p className="text-sm text-muted-foreground">
          Explique os fatos ocorridos e fundamente sua defesa com base jurídica.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Defesa Prévia:</strong> É a primeira fase do processo administrativo de trânsito, 
          onde você pode questionar vícios formais do Auto de Infração (erros de preenchimento, 
          identificação incorreta, problemas com o equipamento de medição, etc.).
          <br /><br />
          O foco deve ser em aspectos técnicos e formais do auto, não na intenção ou na justificativa 
          pessoal para a infração.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="motivoDefesa">Explique os fatos ocorridos *</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGenerateExplanation}
              disabled={generatingExplanation}
              className="gap-2"
            >
              {generatingExplanation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar explicação com IA
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="motivoDefesa"
            value={data.motivoDefesa}
            onChange={(e) => updateData({ motivoDefesa: e.target.value })}
            placeholder="Descreva os fatos ocorridos no dia da infração. Ex: 'No dia e local indicados, não cometi a infração descrita devido a...'"
            rows={6}
            required
          />
          <p className="text-xs text-muted-foreground">
            Use o botão acima para gerar uma explicação com IA baseada nos dados do AIT ou escreva manualmente.
          </p>
          {!data.motivoDefesa.trim() && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Este campo é obrigatório
            </p>
          )}
        </div>


        {/* Documentos probatórios opcionais */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm">Documentos Probatórios (Opcional)</h4>
          
          {/* Fotos do local */}
          <div className="space-y-2">
            <Label htmlFor="localPhotos">Fotos do local</Label>
            <div className="space-y-2">
              <Input
                id="localPhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setLocalPhotos(prev => [...prev, ...files]);
                  updateData({ anexos: [...data.anexos, ...files] });
                }}
                className="cursor-pointer"
              />
              {localPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localPhotos.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded text-sm">
                      <FileText className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setLocalPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Fotos do local da infração podem auxiliar na defesa
            </p>
          </div>

          {/* Outros documentos */}
          <div className="space-y-2">
            <Label htmlFor="otherDocs">Outros documentos probatórios</Label>
            <div className="space-y-2">
              <Input
                id="otherDocs"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setOtherDocs(prev => [...prev, ...files]);
                  updateData({ anexos: [...data.anexos, ...files] });
                }}
                className="cursor-pointer"
              />
              {otherDocs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {otherDocs.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded text-sm">
                      <FileText className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setOtherDocs(prev => prev.filter((_, i) => i !== idx))}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              CNH, documentos do veículo, testemunhas, etc.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Exemplos de vícios formais comuns:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Erro na identificação do condutor ou do veículo</li>
          <li>Ausência de assinatura do agente autuador</li>
          <li>Falta de informações obrigatórias no auto</li>
          <li>Equipamento de medição sem certificado de aferição</li>
          <li>Descrição genérica ou imprecisa da infração</li>
          <li>Erro na tipificação da infração</li>
        </ul>
      </div>

      {!isFormValid() && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Preencha o campo de explicação dos fatos para continuar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}