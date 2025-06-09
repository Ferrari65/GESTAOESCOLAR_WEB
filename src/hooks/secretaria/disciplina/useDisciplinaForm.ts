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

        if (onRefetch) {
          onRefetch();
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
          console.log(" createDisciplina lançou erro:", err);
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
