import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, FileText, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 gradient-hero opacity-95" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Geração Inteligente de Defesa Prévia</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight text-balance">
            <span className="text-yellow-400">Sua Defesa</span> de Multa <span className="text-yellow-400">em Minutos</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto text-balance">
            <span className="text-yellow-400">Gere documentos profissionais</span> de Defesa Prévia com IA, conforme CTB e Resolução Contran 918/2022
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="xl" 
              variant="hero"
              onClick={onStart}
              className="group bg-yellow-400 text-yellow-950 hover:bg-yellow-300 border-yellow-300"
            >
              Iniciar Minha Defesa
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-primary-foreground/60">
              Prévia gratuita • Documento completo por R$ 27,90
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Questionário Guiado</h3>
              <p className="text-sm text-muted-foreground text-center">
                Perguntas simples que coletam todas as informações necessárias
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Geração com IA</h3>
              <p className="text-sm text-muted-foreground text-center">
                Defesa elaborada automaticamente seguindo normas legais
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Prévia Gratuita</h3>
              <p className="text-sm text-muted-foreground text-center">
                Veja o documento completo antes de pagar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
