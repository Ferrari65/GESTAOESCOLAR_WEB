import { useState, useCallback } from 'react';
import { getAPIClient, handleApiError } from '@/services/api';
import { validateCursoDTO } from '@/schemas/secretaria/curso/cursoValidations';
import type { Curso, UseCursoAPIReturn } from '@/types/secretariaTypes/cadastroCurso/curso';
import type { CursoDTO } from '@/schemas/secretaria/curso/cursoValidations';

export const useCursoAPI = (): UseCursoAPIReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const createCurso = useCallback(async (data: CursoDTO): Promise<Curso> => {
        setLoading(true);
        setError(null);
        try {
            const validation = validateCursoDTO(data);
            if (!validation.success) {
                throw new Error('Dados invalidos: ' + validation.error?.issues[0].message);
            }

            const validData = validation.data;
            const api = getAPIClient();

            const response = await api.post(`/curso/${validData.id_secretaria}`, validData);

            return response.data;
        } catch (err: unknown) {

            const { message } = handleApiError(err, 'CreateCurso');
            
            let errorMessage = message;
            if ((err as any)?.response?.status === 400 && 
                typeof (err as any)?.response?.data === 'string' && 
                (err as any)?.response?.data.toLowerCase().includes('curso já cadastrado')) {
                errorMessage = 'Este curso já está cadastrado no sistema.';
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createCurso,
        loading,
        error,
        clearError
    };
};

// ✅ REMOVIDA: Função getErrorMessage duplicada (agora usando handleApiError do api.ts)