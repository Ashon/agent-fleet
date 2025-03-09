interface FormFieldProps {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export default function FormField({
  label,
  required,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`form-control w-full grid gap-1 ${className}`}>
      <label className="label">
        <span className="label-text font-medium">{label}</span>
        {required && (
          <span className="badge badge-sm badge-primary badge-outline">
            Required
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
