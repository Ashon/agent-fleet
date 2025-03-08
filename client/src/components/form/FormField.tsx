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
    <div className={`form-control w-full ${className}`}>
      <label className="label mb-1">
        <span className="label-text font-medium">{label}</span>
        {required && (
          <span className="badge badge-sm badge-primary badge-outline">
            필수
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
