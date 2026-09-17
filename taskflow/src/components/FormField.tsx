import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: FieldError;
  hint?: string;
  children: React.ReactNode;
}

const FormField = ({ label, error, hint, children }: FormFieldProps) => (
  <div>
    <label className="text-xs text-gray-400 mb-1 block font-medium">{label}</label>
    {children}
    {hint && !error && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
    {error && <p className="text-red-400 text-xs mt-1">⚠️ {error.message}</p>}
  </div>
);

export default FormField;
