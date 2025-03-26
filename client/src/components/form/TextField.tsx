import { Input } from '../ui/input'
import FormField from './FormField'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldId: string
  label: string
  required?: boolean
  className?: string
}

export default function TextField({
  fieldId,
  label,
  required,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <FormField
      htmlFor={fieldId}
      label={label}
      required={required}
      className={className}
    >
      <Input
        id={fieldId}
        type="text"
        className="input input-bordered w-full mt-1"
        {...props}
      />
    </FormField>
  )
}
