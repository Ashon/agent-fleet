import { Badge } from '../ui/badge'
import { Label } from '../ui/label'

interface FormFieldProps {
  htmlFor?: string
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export default function FormField({
  htmlFor,
  label,
  required,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`form-control w-full grid gap-1 ${className}`}>
      <Label htmlFor={htmlFor}>
        <span className="label-text font-medium">{label}</span>
        {required && <Badge variant="outline">Required</Badge>}
      </Label>
      {children}
    </div>
  )
}
