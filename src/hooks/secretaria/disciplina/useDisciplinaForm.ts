import { AuthContext } from "@/contexts/AuthContext";
import { useCallback, useContext, useState } from "react";
import { useDisciplinaAPI } from "./useDisciplinaAPI";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formDataToDisciplinaDTO } from "@/utils/transformers";
import { log } from '@/utils/logger';
import {
  DisciplinaFormData,
  disciplinaFormSchema
} from "@/schemas";
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
      cargaHoraria: "" 
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    clearError(); 
  }, [clearError]);

  const onSubmit = useCallback(
    async (data: DisciplinaFormData) => {
      clearMessages();

      if (!user?.id) {
        form.setError("nome", { message: "Faça login novamente." });
        return;
      }

      try {
        const disciplinaDTO = formDataToDisciplinaDTO(data, user.id);
        await createDisciplina(disciplinaDTO);

        form.reset();
        setSuccessMessage("Disciplina cadastrada com sucesso!");

        if (process.env.NODE_ENV === 'development') {
          log.success('DISCIPLINA', `Disciplina "${data.nome}" cadastrada`);
        }

        // Callbacks
        if (onRefetch) {
          onRefetch();
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (err: unknown) {

        if (process.env.NODE_ENV === 'development') {
          log.error('DISCIPLINA', 'Erro ao cadastrar disciplina', err);
        }
        return;
      }
    },
    [user?.id, createDisciplina, form, clearMessages, onRefetch, onSuccess]
  );

  return {
    form,
    onSubmit,
    loading,
    error: apiError,
    successMessage,
    clearMessages
  };
};

export default useDisciplinaForm;