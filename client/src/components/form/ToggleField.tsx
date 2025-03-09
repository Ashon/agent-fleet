import FormField from './FormField'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  className?: string
}

export default function ToggleField({
  label,
  required,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <FormField label={label} required={required} className={className}>
      <input type="checkbox" className="toggle" {...props} />
    </FormField>
  )
}
