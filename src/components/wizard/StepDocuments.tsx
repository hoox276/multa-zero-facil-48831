import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardData } from "../Wizard";

interface StepDocumentsProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepDocuments({ data, updateData }: StepDocumentsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      updateData({ anexos: [...data.anexos, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    const newAnexos = data.anexos.filter((_, i) => i !== index);
    updateData({ anexos: newAnexos });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Documentos Anexos</h3>
        <p className="text-sm text-muted-foreground">
          Anexe os documentos que comprovam sua defesa (opcional, mas recomendado).
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Documentos recomendados:</strong>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
            <li>Cópia da Notificação de Autuação</li>
            <li>Cópia do Auto de Infração</li>
            <li>Documento do veículo (CRLV)</li>
            <li>CNH do condutor</li>
            <li>Fotos do local (se aplicável)</li>
            <li>Outros documentos probatórios</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-base font-medium">Clique para adicionar arquivos</div>
              <div className="text-sm text-muted-foreground">
                ou arraste e solte aqui
              </div>
            </Label>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG até 10MB cada
            </p>
          </div>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {data.anexos.length > 0 && (
          <div className="space-y-2">
            <Label>Arquivos Anexados ({data.anexos.length})</Label>
            <div className="space-y-2">
              {data.anexos.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Alert variant="default">
        <FileText className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Os documentos anexados serão mencionados na sua defesa e deverão ser apresentados 
          junto com o protocolo no órgão autuador. Guarde-os em local seguro até o fim do processo.
        </AlertDescription>
      </Alert>
    </div>
  );
}
