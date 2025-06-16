
export type UserRole = 'ROLE_SECRETARIA' | 'ROLE_PROFESSOR' | 'ROLE_ALUNO';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthError {
  type: 'validation' | 'network' | 'unauthorized' | 'server' | 'unknown';
  message: string;
  statusCode?: number;
}

export interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

export interface BaseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  secretariaData?: SecretariaData | null;
  user: User;
  onSignOut: () => void;
  showSignOutButton?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export interface SidebarProps {
  className?: string;
  onMenuItemClick?: (itemId: string) => void;
}
