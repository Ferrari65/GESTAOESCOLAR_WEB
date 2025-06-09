'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import type { ProfessorFormData } from '@/schemas'; // ✅ CORRIGIDO

interface AddressSectionProps {
  form: UseFormReturn<ProfessorFormData>;
}

const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export const AddressSection: React.FC<AddressSectionProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="border-t border-gray-200 pt-4">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Endereço</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <FormInput
          label="Logradouro"
          {...register('logradouro')} // ✅ Zod já valida
          error={errors.logradouro?.message || ''}
        />

        <FormInput
          label="Número"
          {...register('numero')} // ✅ Zod já valida
          error={errors.numero?.message || ''}
        />

        <FormInput
          label="Bairro"
          {...register('bairro')} // ✅ Zod já valida
          error={errors.bairro?.message || ''}
        />

        <FormInput
          label="Cidade"
          {...register('cidade')} // ✅ Zod já valida
          error={errors.cidade?.message || ''}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Estado (UF)</label>
          <select
            {...register('uf')} // ✅ Zod já valida
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">Selecione o estado</option>
            {ESTADOS_BRASIL.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label} ({estado.value})
              </option>
            ))}
          </select>
          {errors.uf && <span className="text-sm text-red-500">{errors.uf.message}</span>}
        </div>

      </div>
    </div>
  );
};