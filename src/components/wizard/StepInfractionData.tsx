import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { WizardData } from "../Wizard";

interface StepInfractionDataProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

interface ValidationErrors {
  numeroAuto?: string;
  dataInfracao?: string;
  dataCiencia?: string;
  orgaoAutuador?: string;
  ufOrgao?: string;
  localInfracao?: string;
  descricaoInfracao?: string;
  valorMulta?: string;
}

const ORGAOS_AUTUADORES = [
  "DETRAN",
  "PRF - Polícia Rodoviária Federal",
  "CET - Companhia de Engenharia de Tráfego",
  "PM - Polícia Militar",
  "GMet - Guarda Municipal de Trânsito",
  "DER - Departamento de Estradas de Rodagem",
  "Outro",
];

const ESTADOS_BRASILEIROS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

export function StepInfractionData({ data, updateData }: StepInfractionDataProps) {
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
        
      case 'ufOrgao':
        if (!value.trim()) {
          newErrors.ufOrgao = 'UF do órgão é obrigatória';
        } else {
          delete newErrors.ufOrgao;
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

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL'
    });
  };

  const handleChange = (field: keyof ValidationErrors, value: string) => {
    let formattedValue = value;
    
    if (field === 'valorMulta') {
      formattedValue = formatCurrency(value);
    }
    
    updateData({ [field]: formattedValue });
    if (touched[field]) {
      validateField(field, formattedValue);
    }
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 &&
      data.numeroAuto.trim() &&
      data.dataInfracao.trim() &&
      data.dataCiencia.trim() &&
      data.orgaoAutuador.trim() &&
      data.ufOrgao.trim() &&
      data.localInfracao.trim() &&
      data.descricaoInfracao.trim() &&
      data.valorMulta.trim();
  };

  useEffect(() => {
    updateData({ _step2Valid: isFormValid() } as any);
  }, [data.numeroAuto, data.dataInfracao, data.dataCiencia, data.orgaoAutuador, data.ufOrgao, data.localInfracao, data.descricaoInfracao, data.valorMulta, errors]);

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
          Preencha os dados conforme constam no Auto de Infração (AIT).
        </p>
      </div>

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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orgaoAutuador">Órgão Autuador *</Label>
            <Select
              value={data.orgaoAutuador}
              onValueChange={(value) => {
                updateData({ orgaoAutuador: value });
                if (touched.orgaoAutuador) {
                  validateField('orgaoAutuador', value);
                }
              }}
            >
              <SelectTrigger 
                id="orgaoAutuador"
                className={touched.orgaoAutuador && errors.orgaoAutuador ? 'border-destructive' : ''}
                onBlur={() => handleBlur('orgaoAutuador')}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ORGAOS_AUTUADORES.map((orgao) => (
                  <SelectItem key={orgao} value={orgao}>
                    {orgao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.orgaoAutuador && errors.orgaoAutuador && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.orgaoAutuador}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ufOrgao">UF do Órgão *</Label>
            <Select
              value={data.ufOrgao}
              onValueChange={(value) => {
                updateData({ ufOrgao: value });
                if (touched.ufOrgao) {
                  validateField('ufOrgao', value);
                }
              }}
            >
              <SelectTrigger 
                id="ufOrgao"
                className={touched.ufOrgao && errors.ufOrgao ? 'border-destructive' : ''}
                onBlur={() => handleBlur('ufOrgao')}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla}>
                    {estado.sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.ufOrgao && errors.ufOrgao && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.ufOrgao}
              </p>
            )}
          </div>
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
