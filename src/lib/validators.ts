// Validation utilities for CPF and WhatsApp E.164 format

/**
 * Validates Brazilian CPF using module 11 algorithm
 * Rejects sequential patterns like 111.111.111-11
 */
export function validateCPF(cpf: string): { valid: boolean; error?: string } {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Check length
  if (cleanCPF.length !== 11) {
    return { valid: false, error: 'CPF deve ter 11 dígitos' };
  }
  
  // Check for sequential patterns
  const isSequential = /^(\d)\1{10}$/.test(cleanCPF);
  if (isSequential) {
    return { valid: false, error: 'CPF inválido (sequência repetida)' };
  }
  
  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  // Verify digits
  if (parseInt(cleanCPF.charAt(9)) !== digit1 || parseInt(cleanCPF.charAt(10)) !== digit2) {
    return { valid: false, error: 'CPF inválido (dígitos verificadores incorretos)' };
  }
  
  return { valid: true };
}

/**
 * Format CPF with mask: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

/**
 * Validates and normalizes Brazilian WhatsApp to E.164 format
 * Accepts: DDD (2 digits) + 9 digits (mobile)
 * Returns: +55DDDxxxxxxxxx (E.164 format)
 */
export function validateWhatsApp(phone: string): { valid: boolean; error?: string; e164?: string } {
  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check for Brazilian mobile pattern (DDD + 9 digits)
  // Must have 11 digits total (2 DDD + 9 mobile with 9 as first digit)
  if (cleanPhone.length !== 11) {
    return { valid: false, error: 'WhatsApp deve ter DDD (2 dígitos) + 9 dígitos móveis' };
  }
  
  // Check if third digit is 9 (mobile number)
  if (cleanPhone.charAt(2) !== '9') {
    return { valid: false, error: 'Número deve ser móvel (começar com 9 após o DDD)' };
  }
  
  // Valid Brazilian DDDs (area codes)
  const validDDDs = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99', // MA
  ];
  
  const ddd = cleanPhone.substring(0, 2);
  if (!validDDDs.includes(ddd)) {
    return { valid: false, error: 'DDD inválido' };
  }
  
  // Convert to E.164 format
  const e164 = `+55${cleanPhone}`;
  
  return { valid: true, e164 };
}

/**
 * Format WhatsApp with mask: (00) 00000-0000
 */
export function formatWhatsApp(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

/**
 * Format CEP with mask: 00000-000
 */
export function formatCEP(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
}
