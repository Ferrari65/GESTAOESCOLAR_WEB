import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { getAPIClient, handleApiError } from "@/services/api";
import { useCursoList } from "@/hooks/secretaria/curso";
import type { TurmaListItem } from "@/schemas";

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

interface TurmaBackend {
    idTurma?: string | number;
    id?: string | number;
    id_turma?: string | number;
    nome?: string;
    ano?: string | number;
    turno?: string;
    idCurso?: string | number;
}

interface CursoItem {
    idCurso: string | number;
    nome: string;
}

const turmaCache: TurmaCache = {
    data: [],
    timestamp: 0,
    isLoading: false,
    lastUserId: ''
};

const CACHE_DURATION = 3 * 60 * 1000;

function isDataFresh(userId: string): boolean {
    return turmaCache.data.length > 0 &&
        turmaCache.lastUserId === userId &&
        Date.now() - turmaCache.timestamp < CACHE_DURATION;
}

function normalizeTurmasData(data: unknown): TurmaBackend[] {
    if (Array.isArray(data)) {
        return data as TurmaBackend[];
    }

    if (!data || typeof data !== 'object') {
        return data ? [data as TurmaBackend] : [];
    }

    const dataObj = data as Record<string, unknown>;

    if (dataObj.turmas && Array.isArray(dataObj.turmas)) {
        return dataObj.turmas as TurmaBackend[];
    }
    if (dataObj.data && Array.isArray(dataObj.data)) {
        return dataObj.data as TurmaBackend[];
    }
    if (dataObj.content && Array.isArray(dataObj.content)) {
        return dataObj.content as TurmaBackend[];
    }

    return [data as TurmaBackend];
}

function mapTurmaWithCurso(turmaBackend: TurmaBackend, cursos: CursoItem[]): TurmaListItem | null {
    try {
        const id = turmaBackend.idTurma || turmaBackend.id || turmaBackend.id_turma;
        const nome = turmaBackend.nome;
        const ano = turmaBackend.ano;
        const turno = turmaBackend.turno || 'DIURNO';
        const idCurso = turmaBackend.idCurso;

        if (!id || !nome) {
            return null;
        }

        let nomeCurso = 'Curso não encontrado';
        if (idCurso && cursos.length > 0) {
            const cursoEncontrado = cursos.find(curso => 
                String(curso.idCurso) === String(idCurso)
            );
            
            if (cursoEncontrado) {
                nomeCurso = cursoEncontrado.nome;
            }
        }

        const turmaMapeada: TurmaListItem = {
            id: String(id),
            nome: String(nome).trim(),
            ano: String(ano || ''),
            turno: (turno === 'NOTURNO' ? 'NOTURNO' : 'DIURNO') as 'DIURNO' | 'NOTURNO',
            nomeCurso
        };

        return turmaMapeada;

    } catch {
        return null;
    }
}

export const useTurmaList = (): UseTurmaListReturn => {
    const { user } = useContext(AuthContext);
    const userId = user?.id || '';

    const { cursos, loading: cursosLoading } = useCursoList();

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

        if (cursosLoading) {
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
            
            const cursosValidos: CursoItem[] = cursos
                .filter((curso: any) => 
                    typeof curso.idCurso !== 'undefined' && typeof curso.nome === 'string'
                )
                .map((curso: any) => ({
                    idCurso: curso.idCurso,
                    nome: curso.nome
                } as CursoItem));

            for (const turma of normalizedData) {
                if (!turma) continue;
                
                try {
                    const turmaMapeada = mapTurmaWithCurso(turma, cursosValidos);
                    if (turmaMapeada) {
                        turmasValidas.push(turmaMapeada);
                    }
                } catch {
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
    }, [userId, cursos, cursosLoading]);

    const refetch = useCallback(() => {
        clearError();
        fetchTurmas(true);
    }, [fetchTurmas, clearError]);

    useEffect(() => {
        if (userId && !cursosLoading && cursos.length > 0) {
            fetchTurmas();
        }
    }, [userId, cursos.length, cursosLoading, fetchTurmas]);

    return {
        turmas,
        loading: loading || cursosLoading,
        error,
        refetch,
        clearError,
        isDataFresh: isDataFresh(userId)
    };
};