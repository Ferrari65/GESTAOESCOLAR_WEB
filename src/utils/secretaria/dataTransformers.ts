// utils/dataTransformers.ts

import type { ProfessorFormData, ProfessorDTO } from '@/types/secretariaTypes/cadastroprofessor/professor';

export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/[^\d]/g, '').toUpperCase();
};

export const cleanPhone = (phone: string): string => {
  return phone.replace(/[^\d]/g, '');
};

export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const clean = cleanPhone(phone);
  return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formDataToDTO = (
  data: ProfessorFormData, 
  secretariaId: string
): ProfessorDTO => {
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);
  const dataNasc = new Date(data.data_nasc).toISOString().split('T')[0];

  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    email: data.email.trim().toLowerCase(),
    senha: data.senha,
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    sexo: data.sexo.toUpperCase(),
    telefone: telefoneLimpo,
    data_nasc: dataNasc,
    situacao: 'ATIVO' as const,
    id_secretaria: secretariaId
  };
};

export const validateFormData = (data: ProfessorFormData): string[] => {
  const errors: string[] = [];

  if (!data.nome?.trim()) errors.push('Nome é obrigatório');
  if (!data.email?.trim()) errors.push('Email é obrigatório');
  if (!data.senha) errors.push('Senha é obrigatória');
  if (!data.cpf) errors.push('CPF é obrigatório');
  if (!data.telefone) errors.push('Telefone é obrigatório');
  if (!data.data_nasc) errors.push('Data de nascimento é obrigatória');
  if (!data.sexo) errors.push('Sexo é obrigatório');
  if (!data.logradouro?.trim()) errors.push('Logradouro é obrigatório');
  if (!data.bairro?.trim()) errors.push('Bairro é obrigatório');
  if (!data.numero) errors.push('Número é obrigatório');
  if (!data.cidade?.trim()) errors.push('Cidade é obrigatória');
  if (!data.uf) errors.push('UF é obrigatória');

  return errors;
};