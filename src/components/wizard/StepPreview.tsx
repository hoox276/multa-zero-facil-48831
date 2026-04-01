import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, Lock, Info, CreditCard } from "lucide-react";
import { WizardData } from "../Wizard";
import { toast } from "sonner";

interface StepPreviewProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepPreview({ data, updateData }: StepPreviewProps) {
  const [generating, setGenerating] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleGeneratePreview = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setPreviewGenerated(true);
    }, 2000);
  };

  // Bloquear atalhos de impressão e captura
  useEffect(() => {
    if (!previewGenerated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+P, Cmd+P, Print Screen
      if (
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        toast.error('Impressão desabilitada. Efetue o pagamento para baixar o documento.');
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [previewGenerated]);

  const handlePayment = () => {
    // TODO: Integrar Stripe
    toast.info('Integração Stripe em desenvolvimento');
    // Simulação de pagamento
    setTimeout(() => {
      setPaymentCompleted(true);
      toast.success('Pagamento confirmado! Downloads liberados.');
    }, 3000);
  };

  const handleDownloadDOCX = () => {
    if (!paymentCompleted) return;
    toast.success('Download do arquivo .DOCX iniciado');
    // TODO: Gerar e baixar DOCX
  };

  const handleDownloadPDF = () => {
    if (!paymentCompleted) return;
    toast.success('Download do arquivo .PDF iniciado');
    // TODO: Gerar e baixar PDF
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Prévia do Documento</h3>
        <p className="text-sm text-muted-foreground">
          Visualize sua Defesa Prévia antes de pagar. Pagamento de R$ 27,90 libera os downloads.
        </p>
      </div>

      {!previewGenerated ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Gerar Prévia do Documento</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Clique no botão abaixo para gerar a prévia da sua Defesa Prévia com base nas informações fornecidas.
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleGeneratePreview}
            disabled={generating}
            className="mt-4"
          >
            {generating ? "Gerando..." : "Gerar Prévia Gratuita"}
          </Button>
        </div>
      ) : (
        <>
          {/* Document Preview with Watermark */}
          <Card className="p-6 bg-card relative overflow-hidden select-none">
            {/* Marca d'água */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-10">
              <div className="text-center rotate-[-45deg] space-y-2">
                <p className="text-6xl font-bold whitespace-nowrap">{data.nome || 'PRÉVIA'}</p>
                <p className="text-3xl whitespace-nowrap">CPF: {data.cpf}</p>
                <p className="text-2xl whitespace-nowrap">{new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="space-y-4 relative z-0">
              <div className="flex items-center justify-between pb-4 border-b">
                <h4 className="font-semibold">Prévia da Defesa Prévia</h4>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Simulated document content */}
              <div className="prose prose-sm max-w-none space-y-4 max-h-96 overflow-y-auto p-4 bg-background rounded border">
                <div className="text-center space-y-2">
                  <p className="font-bold">DEFESA PRÉVIA</p>
                  <p className="text-sm">Auto de Infração nº {data.numeroAuto || "[NÚMERO]"}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Ao {data.orgaoAutuador || "[ÓRGÃO AUTUADOR]"}</strong>
                  </p>

                  <p>
                    <strong>{data.nome || "[NOME DO AUTUADO]"}</strong>, CPF nº {data.cpf || "[CPF]"}, 
                    residente e domiciliado em {data.endereco || "[ENDEREÇO]"}, 
                    {data.cidade || "[CIDADE]"}/{data.estado || "[UF]"}, por meio deste instrumento, 
                    vem, respeitosamente, perante V.Sa., nos termos do art. 280 e seguintes do Código de 
                    Trânsito Brasileiro (Lei nº 9.503/97) e da <span className="text-yellow-600 font-semibold">Resolução CONTRAN nº 918/2022</span>, apresentar
                  </p>

                  <p className="text-center font-bold">DEFESA PRÉVIA</p>

                  <p>
                    em face do Auto de Infração nº {data.numeroAuto || "[NÚMERO]"}, referente à infração 
                    supostamente praticada em {data.dataInfracao ? new Date(data.dataInfracao).toLocaleDateString('pt-BR') : "[DATA]"}, 
                    no local {data.localInfracao || "[LOCAL]"}, pelos seguintes fundamentos de fato e de direito:
                  </p>

                  <div className="space-y-2">
                    <p className="font-semibold">I. DOS FATOS</p>
                    <p>
                      {data.motivoDefesa || "[Explicação dos fatos será inserida aqui]"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold">II. DO DIREITO E DOS FUNDAMENTOS DA DEFESA</p>
                    <p>
                      [Fundamentação legal completa baseada no CTB e Resolução Contran 918/2022]
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold">III. DOS PEDIDOS</p>
                    <p>
                      Diante do exposto, requer-se:
                    </p>
                    <ul className="list-decimal list-inside space-y-1 ml-4">
                      <li>O conhecimento e recebimento da presente Defesa Prévia;</li>
                      <li>O cancelamento do Auto de Infração;</li>
                      <li>Subsidiariamente, caso não seja acatada a defesa prévia, que seja garantido 
                        o direito ao recurso em primeira e segunda instâncias.</li>
                    </ul>
                  </div>

                  <p className="pt-4">
                    Nestes termos, pede deferimento.
                  </p>

                  <div className="pt-8">
                    <p>{data.cidade || "[CIDADE]"}/{data.estado || "[UF]"}, {new Date().toLocaleDateString('pt-BR')}</p>
                    <div className="pt-8 border-t border-gray-300 mt-8 w-64">
                      <p className="text-center">{data.nome || "[NOME]"}</p>
                      <p className="text-center text-xs">CPF: {data.cpf || "[CPF]"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Mensagens orientativas */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p>
                <strong>Importante:</strong> A Defesa Prévia é a etapa anterior à aplicação da penalidade. 
                Os prazos e canais para protocolo constam na Notificação de Autuação emitida pelo órgão autuador.
              </p>
            </AlertDescription>
          </Alert>

          {/* Payment Section */}
          <Card className="p-6 bg-gradient-card border-2 border-primary/20">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  {paymentCompleted ? (
                    <Download className="w-6 h-6 text-green-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-secondary" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-semibold">
                    {paymentCompleted ? 'Downloads Disponíveis' : 'Download do Documento Final'}
                  </h4>
                  {!paymentCompleted ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Para baixar o documento completo em formato .DOCX e .PDF com toda a fundamentação 
                        jurídica elaborada por IA, realize o pagamento de <strong className="text-foreground">R$ 27,90</strong>.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ Documento completo em .DOCX e .PDF</li>
                        <li>✓ Fundamentação jurídica completa</li>
                        <li>✓ Referências ao CTB e Resolução 918/2022</li>
                        <li>✓ Pronto para protocolo</li>
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-green-600">
                      ✓ Pagamento confirmado! Faça o download dos seus documentos abaixo.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant={paymentCompleted ? "default" : "secondary"} 
                  size="lg" 
                  className="flex-1" 
                  disabled={!paymentCompleted}
                  onClick={handleDownloadDOCX}
                >
                  <Download className="mr-2 w-4 h-4" />
                  Baixar em Word (.docx)
                </Button>
                <Button 
                  variant={paymentCompleted ? "default" : "secondary"} 
                  size="lg" 
                  className="flex-1" 
                  disabled={!paymentCompleted}
                  onClick={handleDownloadPDF}
                >
                  <Download className="mr-2 w-4 h-4" />
                  Baixar em PDF (.pdf)
                </Button>
              </div>

              {!paymentCompleted && (
                <>
                  <Button size="lg" className="w-full" onClick={handlePayment}>
                    <CreditCard className="mr-2 w-4 h-4" />
                    Pagar R$ 27,90 e Liberar Downloads
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Pagamento seguro via Stripe • Pix ou Cartão • Liberação imediata
                  </p>
                </>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
