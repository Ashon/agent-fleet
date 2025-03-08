import FormField from './FormField'

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  className?: string
}

export default function TextArea({
  label,
  required,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <FormField label={label} required={required} className={className}>
      <textarea
        className="textarea textarea-bordered w-full mt-1 h-32 resize-none"
        {...props}
      />
    </FormField>
  )
}
