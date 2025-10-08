import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepPersonalData } from "./wizard/StepPersonalData";
import { StepInfractionData } from "./wizard/StepInfractionData";
import { StepDefenseReason } from "./wizard/StepDefenseReason";
import { StepPreview } from "./wizard/StepPreview";

export interface WizardData {
  // Dados pessoais
  nome: string;
  cpf: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;

  // Dados da infração
  orgaoAutuador: string;
  ufOrgao: string;
  numeroAuto: string;
  dataInfracao: string;
  dataCiencia: string;
  localInfracao: string;
  descricaoInfracao: string;
  valorMulta: string;

  // Fatos e fundamentos
  motivoDefesa: string;

  // Documentos
  anexos: File[];

  // Validação de etapas
  _step1Valid?: boolean;
  _step2Valid?: boolean;
  _step3Valid?: boolean;
}

const STEPS = [
  { title: "Dados Pessoais", description: "Suas informações" },
  { title: "Dados da Infração", description: "Detalhes do auto" },
  { title: "Fatos e Fundamentos", description: "Sua versão dos fatos" },
  { title: "Gerar Defesa Prévia", description: "Documento final" },
];

interface WizardProps {
  onComplete: (data: WizardData) => void;
  onBack: () => void;
}

export function Wizard({ onComplete, onBack }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    nome: "",
    cpf: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    orgaoAutuador: "",
    ufOrgao: "",
    numeroAuto: "",
    dataInfracao: "",
    dataCiencia: "",
    localInfracao: "",
    descricaoInfracao: "",
    valorMulta: "",
    motivoDefesa: "",
    anexos: [],
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    if (currentStep === 0) return data._step1Valid;
    if (currentStep === 1) return data._step2Valid;
    if (currentStep === 2) return data._step3Valid;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPersonalData data={data} updateData={updateData} />;
      case 1:
        return <StepInfractionData data={data} updateData={updateData} />;
      case 2:
        return <StepDefenseReason data={data} updateData={updateData} />;
      case 3:
        return <StepPreview data={data} updateData={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with progress */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {STEPS[currentStep].description}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Etapa {currentStep + 1} de {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex-1 text-center ${
                index < STEPS.length - 1 ? "border-r border-border" : ""
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`text-xs ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="p-6 mb-6 shadow-medium">
          {renderStep()}
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? "Voltar ao Início" : "Anterior"}
          </Button>
          <Button
            onClick={handleNext}
            className="gap-2"
            disabled={!canProceed()}
          >
            {currentStep === STEPS.length - 1 ? "Finalizar" : "Próximo"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
