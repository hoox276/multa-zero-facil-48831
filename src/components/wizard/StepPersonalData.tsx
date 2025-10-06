import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WizardData } from "../Wizard";
import { validateCPF, formatCPF, validateWhatsApp, formatWhatsApp, formatCEP } from "@/lib/validators";

interface StepPersonalDataProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

interface ValidationErrors {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

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
        
      case 'telefone':
        if (!value.trim()) {
          newErrors.telefone = 'WhatsApp é obrigatório';
        } else {
          const validation = validateWhatsApp(value);
          if (!validation.valid) {
            newErrors.telefone = validation.error;
          } else {
            delete newErrors.telefone;
            // Store E.164 format internally
            updateData({ telefone: validation.e164! });
          }
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'E-mail inválido';
        } else {
          delete newErrors.email;
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
    } else if (field === 'telefone') {
      formattedValue = formatWhatsApp(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    } else if (field === 'estado') {
      formattedValue = value.toUpperCase().slice(0, 2);
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
      data.telefone.trim() &&
      data.email.trim() &&
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

        <div className="grid md:grid-cols-2 gap-4">
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
            <Label htmlFor="telefone">WhatsApp *</Label>
            <Input
              id="telefone"
              value={data.telefone.startsWith('+55') ? formatWhatsApp(data.telefone.slice(3)) : data.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              onBlur={() => handleBlur('telefone')}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className={touched.telefone && errors.telefone ? 'border-destructive' : ''}
            />
            {touched.telefone && errors.telefone && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.telefone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="seu@email.com"
            className={touched.email && errors.email ? 'border-destructive' : ''}
          />
          {touched.email && errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
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
            <Input
              id="estado"
              value={data.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              onBlur={() => handleBlur('estado')}
              placeholder="SP"
              maxLength={2}
              className={touched.estado && errors.estado ? 'border-destructive' : ''}
            />
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
