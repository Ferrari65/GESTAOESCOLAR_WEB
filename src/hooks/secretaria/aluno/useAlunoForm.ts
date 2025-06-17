import { useState, useContext, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/contexts/AuthContext";
import { getAPIClient, handleApiError } from "@/services/api";
import { alunoCadastroSchema,
    type AlunoCadastroData,
 } from "@/schemas/professor"
import { transformAlunoCadastroToDTO } from "@/utils/transformers";

export interface UseAlunoFormOptions {
    onSucess?: () => void;
    initialData?: Partial<AlunoCadastroData>;
}

 export interface UseAlunoFormReturn {
  form: ReturnType<typeof useForm<AlunoCadastroData>>;
  enviarFormulario: () => Promise<void>;    
  carregando: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  limparMensagens : () => void;
}

function handleAlunoError(error: unknown, context: string): string {
    const { message, status } = handleApiError(error, context);

    switch (status){
        case 400:
            if (message.toLowerCase().includes("cpf")) {
                return "CPF inválido ou já cadastrado.";
            }
            if (message.toLowerCase().includes("email")) {
                return "E-mail inválido ou já cadastrado.";
            }
            if (message.toLowerCase().includes("matricula")) {
                return "Esta Matricula já esta cadastrada.";
            }
            return 'Dados inválidos:' + message;

            case 401:
                return 'Sessão expirada. Por favor, faça login novamente.';
            case 403:
                return 'Você não tem permissão para realizar esta ação.';
            case 404:
                return 'Turma não encontrada.';
            case 409:
                return 'conflito: Já existe um aluno com estes dados';
            case 500:
                return 'Erro interno do servidor. Tente novamente';

            default:
                return message || 'Erro desconecido. Tente novamente';
    }
}

export const useAlunoForm = ({
    onSucess,
    initialData
}: UseAlunoFormOptions = {}): UseAlunoFormReturn => {

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null> (null);
    const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
    const {user} = useContext(AuthContext);

    const getDefaultValues = (): Partial<AlunoCadastroData> => {
        return {
            nome: initialData?.nome ?? '',
            cpf: initialData?.cpf ?? '',
            email: initialData?.email ?? '',
            telefone: initialData?.telefone ?? '',
            matricula: initialData?.matricula ?? '',
            data_nasc: initialData?.data_nasc ?? '',
            sexo: initialData?.sexo ?? 'M',
            logradouro: initialData?.logradouro ?? '',
            numero: initialData?.numero ?? '',
            cidade: initialData?.cidade ?? '', 
            uf: initialData?.uf ?? '',
            bairro: initialData?.bairro ?? '',
            id_turma: initialData?.id_turma ?? '',
        };
    };

    const form = useForm<AlunoCadastroData> ({
        resolver: zodResolver(alunoCadastroSchema),
        mode: 'onBlur',
        defaultValues: getDefaultValues ()
    });
    const limparMensagens = useCallback (() =>{
        setMensagemSucesso(null);
        setErro(null);
    }, []);

    const enviarFormulario = useCallback(async () => {
        console.log(' [ALUNO-FORM] Iniciando cadastro de aluno...');
        
        if (!user?.id) {
        setErro('Sessão expirada. Faça login novamente.');
        return;
        }

     const isValid = await form.trigger();
    if (!isValid){
        setErro('Por favor, corrija os erros no formulario');
        return;
    }

    const data = form.getValues();
    console.log('[ALUNO-FORM] dados do formulario:', data);

     setCarregando(true);
     setErro(null);

    try{
        const createDTO = transformAlunoCadastroToDTO(data);

        console.log('[ALUNO-FORM] Dados transformados para DTO:', createDTO);
        console.log('[ALUNO-FORM] ID da turma:', data.id_turma);

        const api = getAPIClient();
        await api.post(`/aluno/criarAluno/${data.id_turma}`, createDTO);

        setMensagemSucesso('Aluno cadastrado com sucesso! ');

        form.reset({
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            matricula: '',
            data_nasc: '',
            sexo: 'M',
            logradouro: '',
            numero: '',
            cidade: '',
            uf: '',
            bairro: '',
            id_turma: ''
        });
        onSucess?.();

    } catch (err: unknown ){
        console.error('[ALUNO-FORM] erro', err);

        const errorMessage = handleAlunoError( err, 'createAluno');
        setErro(errorMessage);
    } finally{
        setCarregando(false);
     }
    },[user?.id, form, onSucess]);

    return {
    form,
    enviarFormulario,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens  ,
    };
};