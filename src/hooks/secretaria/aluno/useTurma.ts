import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { getAPIClient, handleApiError } from "@/services/api";
import type { TurmaListItem, turmaListItemSchema } from "@/schemas";
import { mapTurmaFromBackend, validateTurmaData } from "@/utils/transformers";

interface UseTurmaListReturn {
    turmas: TurmaListItem[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    clearError: () => void;
    isDataFresh: boolean;
}

interface TurmaCache {
    data: TurmaListItem[];
    timestamp: number;
    isLoading: boolean;
    lastUserId: string;
}

const turmaCache: TurmaCache = {
    data: [],
    timestamp: 0,
    isLoading: false,
    lastUserId: ''
};

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos

function isDataFresh(userId: string): boolean {
    return turmaCache.data.length > 0 &&
        turmaCache.lastUserId === userId &&
        Date.now() - turmaCache.timestamp < CACHE_DURATION;
}

function normalizeTurmasData(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;

    if (!data || typeof data !== 'object') {
        return data ? [data] : [];
    }

    const dataObj = data as Record<string, unknown>;

    if (dataObj.turmas && Array.isArray(dataObj.turmas)) {
        return dataObj.turmas as unknown[];
    }
    if (dataObj.data && Array.isArray(dataObj.data)) {
        return dataObj.data as unknown[];
    }
    if (dataObj.content && Array.isArray(dataObj.content)) {
        return dataObj.content as unknown[];
    }

    return [data];
}

// ==== HOOK ====
export const useTurmaList = (): UseTurmaListReturn => {
    const { user } = useContext(AuthContext);
    const userId = user?.id || '';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); 

    const [turmas, setTurmas] = useState<TurmaListItem[]>(() => {
        return turmaCache.lastUserId === userId ? turmaCache.data : [];
    });

    const clearError = useCallback(() => setError(null), []);

    const fetchTurmas = useCallback(async (forceRefresh = false): Promise<void> => {
        if (!userId) {
            setError('ID da secretaria não encontrado. Faça login novamente.');
            setTurmas([]);
            return;
        }

        if (!forceRefresh && isDataFresh(userId)) {
            setTurmas(turmaCache.data);
            return;
        }

        if (turmaCache.isLoading) return;

        turmaCache.isLoading = true;
        setLoading(true);
        setError(null);

        try {
            const api = getAPIClient();
            const response = await api.get(`/turma/listarPorSecretaria/${userId}`);
            
            if (!response.data) {
                setTurmas([]);
                turmaCache.data = [];
                turmaCache.timestamp = Date.now();
                turmaCache.lastUserId = userId;
                return;
            }

            const normalizedData = normalizeTurmasData(response.data);
            const turmasValidas: TurmaListItem[] = [];
            
            for (const turma of normalizedData) {
                if (!turma || typeof turma !== 'object') continue;
                
                try {
                    if (validateTurmaData(turma)) {
                        const turmaMapeada = mapTurmaFromBackend(turma);
                        if (turmaMapeada) {
                            turmasValidas.push(turmaMapeada);
                        }
                    }
                } catch (err) {
                    continue;
                }
            }

            setTurmas(turmasValidas);
            turmaCache.data = turmasValidas;
            turmaCache.timestamp = Date.now();
            turmaCache.lastUserId = userId;
            
        } catch (err: unknown) {
            const { message } = handleApiError(err, 'FetchTurmas');
            setError(message);
            
            if (turmaCache.data.length > 0 && turmaCache.lastUserId === userId) {
                setTurmas(turmaCache.data);
            } else {
                setTurmas([]);
            }
        } finally {
            setLoading(false);
            turmaCache.isLoading = false;
        }
    }, [userId]);

    const refetch = useCallback(() => {
        clearError();
        fetchTurmas(true);
    }, [fetchTurmas, clearError]);

    // ===== EFEITO INICIAL =====
    useEffect(() => {
        if (userId) {
            fetchTurmas();
        } else {
            setTurmas([]);
            setError(null);
        }
    }, [userId, fetchTurmas]);

    return {
        turmas,
        loading,
        error,
        refetch,
        clearError,
        isDataFresh: isDataFresh(userId)
    };
};