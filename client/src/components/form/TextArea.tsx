import { Textarea } from '../ui/textarea'
import FormField from './FormField'

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldId: string
  label: string
  required?: boolean
  className?: string
}

export default function TextArea({
  fieldId,
  label,
  required,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <FormField
      htmlFor={fieldId}
      label={label}
      required={required}
      className={className}
    >
      <Textarea
        id={fieldId}
        className="textarea textarea-bordered w-full mt-1 h-32 resize-none"
        {...props}
      />
    </FormField>
  )
}
