import { AuthContext } from "@/contexts/AuthContext";
import { useCallback, useContext, useState } from "react";
import { useDisciplinaAPI } from "./useDisciplinaAPI";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formDataToDisciplinaDTO } from "@/utils/transformers";
import {
  DisciplinaFormData,
  disciplinaFormSchema
} from "@/schemas/secretaria/disciplina/disciplinaValidations";
import { UseDisciplinaFormReturn } from "@/types/secretariaTypes/cadastroDisciplina/disciplina";

interface UseDisciplinaFormParams {
  onSuccess?: () => void;
  onRefetch?: () => void;
}

export const useDisciplinaForm = ({
  onSuccess,
  onRefetch
}: UseDisciplinaFormParams = {}): UseDisciplinaFormReturn => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { createDisciplina, loading, error: apiError, clearError } = useDisciplinaAPI();

  const form = useForm<DisciplinaFormData>({
    resolver: zodResolver(disciplinaFormSchema),
    mode: "onBlur",
    defaultValues: {
      nome: "",
      ementa: "",
      cargaHoraria: "" // string, validado pelo Zod antes
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    clearError(); // limpa o erro do useDisciplinaAPI
  }, [clearError]);

  const onSubmit = useCallback(
    async (data: DisciplinaFormData) => {
      // Antes de submeter, limpe mensagens antigas:
      clearMessages();

      if (!user?.id) {
        // Se não houver user.id, exiba erro genérico:
        form.setError("nome", { message: "Faça login novamente." });
        return;
      }

      try {
        const disciplinaDTO = formDataToDisciplinaDTO(data, user.id);
        await createDisciplina(disciplinaDTO);

        // Se chegou aqui, deu tudo certo:
        form.reset();
        setSuccessMessage("Disciplina cadastrada com sucesso!");

        // Recarrega a lista (componente pai):
        if (onRefetch) {
          onRefetch();
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        // Se o createDisciplina lançou um erro, ele cai aqui.
        // O hook useDisciplinaAPI já colocou uma mensagem em `apiError`.
        // Só precisamos garantir que NÃO chamaremos setSuccessMessage.
          console.log("↪️ createDisciplina lançou erro:", err);
        // Se quiser: você pode setar um erro no próprio form, 
        // mas normalmente basta exibir a mensagem vindo de apiError no componente.

        // (Não fazemos nada aqui, pois `apiError` já está preenchido)
        return;
      }
    },
    [user?.id, createDisciplina, form, clearMessages, onRefetch, onSuccess]
  );

  return {
    form,
    onSubmit,
    loading,
    error: apiError,       // usa a mensagem de erro que veio do useDisciplinaAPI
    successMessage,
    clearMessages
  };
};

export default useDisciplinaForm;
