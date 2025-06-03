import {useState, useCallback} from 'react';
import { getAPIClient } from '@/services/api';
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
            const errorMessage = getErrorMessage(err);
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

const getErrorMessage = (err: any): string => {
    if (err.response) {
        const {status, data} = err.response;

        switch (status) {
            case 400:
                if (typeof data === 'string' && data.toLowerCase().includes('curso já cadastrado')) {
                    return 'Este curso já está cadastrado no sistema.';
                }
                return data?.message || 'Dados inválidos. Verifique os campos.';
        
            case 401:
                return 'Sessão expirada. Por favor, faça login novamente.';
        
            case 403:
                return 'Sem permissão para cadastrar curso.';
        
            case 404:
                return 'Secretaria não encontrada.';
        
            default:
                return data?.message || 'Erro desconhecido ao processar solicitação.';
        }
    }
    return err.message || 'Erro de conexão';
};