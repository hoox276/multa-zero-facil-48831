import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Wizard, WizardData } from "@/components/Wizard";

type AppState = "hero" | "wizard" | "complete";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("hero");
  const [formData, setFormData] = useState<WizardData | null>(null);

  const handleStart = () => {
    setAppState("wizard");
  };

  const handleComplete = (data: WizardData) => {
    setFormData(data);
    setAppState("complete");
    console.log("Formulário completo:", data);
  };

  const handleBackToHero = () => {
    setAppState("hero");
  };

  return (
    <div className="min-h-screen">
      {appState === "hero" && <Hero onStart={handleStart} />}
      {appState === "wizard" && (
        <Wizard onComplete={handleComplete} onBack={handleBackToHero} />
      )}
      {appState === "complete" && (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Processo Concluído!
            </h2>
            <p className="text-muted-foreground">
              Os dados foram coletados com sucesso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
