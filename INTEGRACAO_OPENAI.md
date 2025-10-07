# Integração OpenAI - Sistema de Defesa Prévia

## Visão Geral

Este projeto utiliza a API oficial da OpenAI (GPT-5) para automatizar a extração de dados de Autos de Infração de Trânsito (AIT) e geração de defesas jurídicas.

## Fluxo de Integração

### 1. Upload e Extração do AIT (Extract-AIT)

**Localização:** `supabase/functions/extract-ait/index.ts`

**Fluxo:**
1. Usuário faz upload de PDF/JPG/PNG do Auto de Infração
2. Frontend (StepInfractionData.tsx) converte arquivo para base64 data URL
3. Edge function `extract-ait` recebe o arquivo e envia para OpenAI
4. GPT-5 analisa a imagem usando visão computacional
5. Retorna JSON estruturado com os campos extraídos
6. Frontend preenche automaticamente os campos do formulário

**Campos Extraídos:**
- numeroAuto: número do auto de infração
- dataInfracao: data da infração (formato YYYY-MM-DD)
- dataCiencia: data da ciência/notificação (formato YYYY-MM-DD)
- orgaoAutuador: órgão autuador (ex: Detran-SP, PRF, CET)
- localInfracao: local completo da infração
- descricaoInfracao: descrição completa da infração
- valorMulta: valor da multa (apenas números)

**Código Frontend:**
```typescript
// src/components/wizard/StepInfractionData.tsx linha 131-180
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  // Validação e conversão para base64
  const base64Data = await fileToBase64(file);
  
  const { data: extractedData, error } = await supabase.functions.invoke('extract-ait', {
    body: { 
      fileName: file.name,
      fileType: file.type,
      fileData: base64Data
    }
  });
  // Preenche os campos
}
```

### 2. Geração de Explicação dos Fatos

**Localização:** `supabase/functions/generate-defense-explanation/index.ts`

**Fluxo:**
1. Usuário clica em "Gerar explicação com IA"
2. Frontend envia dados do AIT para edge function
3. GPT-5 analisa e gera explicação técnica focada em vícios formais
4. Texto é inserido no campo "Explique os fatos ocorridos"

**Código Frontend:**
```typescript
// src/components/wizard/StepDefenseReason.tsx linha 31-72
const handleGenerateExplanation = async () => {
  const { data: response } = await supabase.functions.invoke('generate-defense-explanation', {
    body: {
      numeroAuto: data.numeroAuto,
      dataInfracao: data.dataInfracao,
      localInfracao: data.localInfracao,
      descricaoInfracao: data.descricaoInfracao,
      orgaoAutuador: data.orgaoAutuador
    }
  });
}
```

### 3. Geração de Fundamentação Legal

**Localização:** `supabase/functions/generate-legal-basis/index.ts`

**Fluxo:**
1. Usuário clica em "Gerar fundamentação"
2. GPT-5 cria fundamentação jurídica baseada no CTB e Resoluções Contran
3. Texto é inserido no campo "Fundamentação Legal"

## Configuração da API OpenAI

### Variáveis de Ambiente

A chave da OpenAI é armazenada como secret no Supabase:
- Nome: `OPENAI_API_KEY`
- Tipo: Secret (criptografado)
- Acesso: Apenas edge functions

### Modelo Utilizado

**GPT-5 (gpt-5-2025-08-07)**
- Modelo mais recente com capacidades de visão
- Suporta análise de imagens em alta resolução
- Parâmetros específicos:
  - `max_completion_tokens`: 800-1000 (ao invés de max_tokens)
  - `temperature`: NÃO suportado (removido do código)

### Endpoint

```
https://api.openai.com/v1/chat/completions
```

## Tratamento de Erros

Todos os edge functions implementam:

1. **Logs detalhados** com prefixo `[nome-da-funcao]`
2. **Validação de entrada** (formato de arquivo, campos obrigatórios)
3. **Parsing de erros da API** com mensagens amigáveis
4. **Propagação de erros** para o frontend via JSON

### Erros Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Invalid MIME type | Verificar formato do arquivo (usar data URL válido) |
| 401 | Authentication error | Verificar OPENAI_API_KEY |
| 429 | Rate limit exceeded | Aguardar ou verificar quota |
| 500 | Server error | Verificar logs do edge function |

## Logs e Depuração

### Console Logs

Todos os edge functions registram:
```typescript
console.log("[function-name] Processing...");
console.log("[function-name] Calling OpenAI API");
console.log("[function-name] Response received successfully");
console.error("[function-name] Error:", error);
```

### Frontend Logs

```typescript
console.log('Calling extract-ait function with file:', file.name);
console.log('Extracted data received:', extractedData);
console.error('Erro ao extrair dados:', error);
```

### Como Acessar Logs

1. **Lovable Console**: Veja os logs em tempo real no console do navegador
2. **Edge Function Logs**: Acesse via Lovable Cloud Dashboard → Functions → Logs
3. **Network Tab**: Inspecione requests/responses no DevTools

## Teste do Fluxo Completo

### 1. Upload do AIT
1. Acesse Etapa 2 - Dados da Infração
2. Clique em "Escolher arquivo"
3. Selecione PDF/JPG/PNG do Auto de Infração
4. Aguarde extração (loader aparece)
5. Campos são preenchidos automaticamente
6. Revise e ajuste se necessário

### 2. Geração de Explicação
1. Acesse Etapa 3 - Fatos e Fundamentos
2. Clique em "Gerar explicação com IA"
3. Aguarde processamento
4. Texto aparece no campo "Explique os fatos ocorridos"

### 3. Geração de Fundamentação
1. Com a explicação preenchida
2. Clique em "Gerar fundamentação"
3. Aguarde processamento
4. Texto aparece no campo "Fundamentação Legal"

## Arquivos Modificados

### Edge Functions (Backend)
- `supabase/functions/extract-ait/index.ts` - Extração de dados do AIT
- `supabase/functions/generate-defense-explanation/index.ts` - Geração de explicação
- `supabase/functions/generate-legal-basis/index.ts` - Geração de fundamentação legal

### Frontend (UI)
- `src/components/wizard/StepInfractionData.tsx` - Upload e extração
- `src/components/wizard/StepDefenseReason.tsx` - Geração de textos com IA

### Configuração
- `.env` - Variáveis de ambiente (auto-gerenciado)
- `supabase/config.toml` - Configuração das funções

## Resolução de Problemas

### Extração não funciona

1. Verificar formato do arquivo (deve ser PDF, JPG ou PNG)
2. Verificar tamanho (máximo 10MB)
3. Verificar logs do edge function
4. Confirmar que OPENAI_API_KEY está configurado

### Botão "Gerar explicação" não responde

1. Abrir console do navegador
2. Verificar se há erros de rede
3. Verificar se campos obrigatórios estão preenchidos
4. Consultar logs do edge function `generate-defense-explanation`

### Erros de API

1. Verificar se OPENAI_API_KEY é válida
2. Verificar saldo/quota da conta OpenAI
3. Revisar logs para mensagens de erro específicas
4. Verificar conectividade com api.openai.com

## Próximos Passos

- [ ] Implementar cache de respostas para reduzir custos
- [ ] Adicionar suporte a múltiplos idiomas
- [ ] Implementar fallback para outros modelos se GPT-5 falhar
- [ ] Adicionar validação mais robusta de JSON retornado
- [ ] Implementar retry automático em caso de falhas temporárias

## Suporte

Para problemas ou dúvidas:
1. Consulte os logs detalhados (console + edge functions)
2. Verifique a documentação da OpenAI: https://platform.openai.com/docs
3. Entre em contato com o suporte técnico
