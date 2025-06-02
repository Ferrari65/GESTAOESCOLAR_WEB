export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.length === 11;
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length === 11;
};

export const validateNumber = (value: string): boolean => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && num <= 99999;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Validações específicas para react-hook-form
export const cpfValidation = {
  required: 'CPF é obrigatório',
  validate: {
    format: (value: string) => {
      if (!validateCPF(value)) {
        return 'CPF deve ter 11 dígitos';
      }
      return true;
    }
  }
};

export const phoneValidation = {
  required: 'Telefone é obrigatório',
  validate: {
    format: (value: string) => {
      if (!validatePhone(value)) {
        return 'Telefone deve ter 11 dígitos';
      }
      return true;
    }
  }
};

export const numberValidation = {
  required: 'Número é obrigatório',
  validate: {
    isValid: (value: string) => {
      if (!validateNumber(value)) {
        return 'Número deve ser um valor numérico positivo menor que 100000';
      }
      return true;
    }
  }
};

export const emailValidation = {
  required: 'E-mail é obrigatório',
  validate: {
    format: (value: string) => {
      if (!validateEmail(value)) {
        return 'E-mail inválido';
      }
      return true;
    }
  }
};