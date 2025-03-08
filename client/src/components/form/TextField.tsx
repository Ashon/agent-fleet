import FormField from './FormField'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  className?: string
}

export default function TextField({
  label,
  required,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <FormField label={label} required={required} className={className}>
      <input
        type="text"
        className="input input-bordered w-full mt-1"
        {...props}
      />
    </FormField>
  )
}
