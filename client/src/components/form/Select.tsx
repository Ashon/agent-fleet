import FormField from './FormField'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  className?: string
  options: Array<{
    value: string
    label: string
  }>
}

export default function Select({
  label,
  required,
  className = '',
  options,
  ...props
}: SelectProps) {
  return (
    <FormField label={label} required={required} className={className}>
      <select className="select select-bordered w-full mt-1" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}
