import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WizardData } from "../Wizard";
import { validateCPF, formatCPF, formatCEP } from "@/lib/validators";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepPersonalDataProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

interface ValidationErrors {
  nome?: string;
  cpf?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

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

export function StepPersonalData({ data, updateData }: StepPersonalDataProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof ValidationErrors, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'nome':
        if (!value.trim()) {
          newErrors.nome = 'Nome é obrigatório';
        } else if (value.trim().split(' ').length < 2) {
          newErrors.nome = 'Informe nome completo';
        } else {
          delete newErrors.nome;
        }
        break;
        
      case 'cpf':
        if (!value.trim()) {
          newErrors.cpf = 'CPF é obrigatório';
        } else {
          const validation = validateCPF(value);
          if (!validation.valid) {
            newErrors.cpf = validation.error;
          } else {
            delete newErrors.cpf;
          }
        }
        break;
        
      case 'endereco':
        if (!value.trim()) {
          newErrors.endereco = 'Endereço é obrigatório';
        } else if (value.trim().length < 10) {
          newErrors.endereco = 'Informe endereço completo';
        } else {
          delete newErrors.endereco;
        }
        break;
        
      case 'cidade':
        if (!value.trim()) {
          newErrors.cidade = 'Cidade é obrigatória';
        } else {
          delete newErrors.cidade;
        }
        break;
        
      case 'estado':
        if (!value.trim()) {
          newErrors.estado = 'Estado é obrigatório';
        } else if (value.trim().length !== 2) {
          newErrors.estado = 'Use sigla do estado (ex: SP)';
        } else {
          delete newErrors.estado;
        }
        break;
        
      case 'cep':
        if (!value.trim()) {
          newErrors.cep = 'CEP é obrigatório';
        } else if (value.replace(/\D/g, '').length !== 8) {
          newErrors.cep = 'CEP deve ter 8 dígitos';
        } else {
          delete newErrors.cep;
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
    let formattedValue = value;
    
    // Apply formatting
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    }
    
    updateData({ [field]: formattedValue });
    
    if (touched[field]) {
      validateField(field, formattedValue);
    }
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 &&
      data.nome.trim() &&
      data.cpf.trim() &&
      data.endereco.trim() &&
      data.cidade.trim() &&
      data.estado.trim() &&
      data.cep.trim();
  };

  // Store validation status for parent component
  useEffect(() => {
    updateData({ _step1Valid: isFormValid() } as any);
  }, [data, errors]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Informações Pessoais</h3>
        <p className="text-sm text-muted-foreground">
          Preencha seus dados conforme constam em seus documentos oficiais. Todos os campos são obrigatórios.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={data.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            onBlur={() => handleBlur('nome')}
            placeholder="João da Silva Santos"
            className={touched.nome && errors.nome ? 'border-destructive' : ''}
          />
          {touched.nome && errors.nome && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.nome}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            value={data.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
            onBlur={() => handleBlur('cpf')}
            placeholder="000.000.000-00"
            maxLength={14}
            className={touched.cpf && errors.cpf ? 'border-destructive' : ''}
          />
          {touched.cpf && errors.cpf && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.cpf}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço Completo *</Label>
          <Input
            id="endereco"
            value={data.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            onBlur={() => handleBlur('endereco')}
            placeholder="Rua, número, complemento"
            className={touched.endereco && errors.endereco ? 'border-destructive' : ''}
          />
          {touched.endereco && errors.endereco && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.endereco}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              value={data.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              onBlur={() => handleBlur('cidade')}
              placeholder="São Paulo"
              className={touched.cidade && errors.cidade ? 'border-destructive' : ''}
            />
            {touched.cidade && errors.cidade && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.cidade}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <Select
              value={data.estado}
              onValueChange={(value) => {
                updateData({ estado: value });
                if (touched.estado) {
                  validateField('estado', value);
                }
              }}
            >
              <SelectTrigger 
                id="estado"
                className={touched.estado && errors.estado ? 'border-destructive' : ''}
                onBlur={() => handleBlur('estado')}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.estado && errors.estado && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.estado}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <Input
              id="cep"
              value={data.cep}
              onChange={(e) => handleChange('cep', e.target.value)}
              onBlur={() => handleBlur('cep')}
              placeholder="00000-000"
              maxLength={9}
              className={touched.cep && errors.cep ? 'border-destructive' : ''}
            />
            {touched.cep && errors.cep && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.cep}
              </p>
            )}
          </div>
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
