import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import FormField from './FormField'

interface SelectProps {
  label: string
  required?: boolean
  className?: string
  placeholder?: string
  options: Array<{
    value: string
    label: string
  }>
  value?: string
  onChange: (value: string) => void
}

export default function SelectUI({
  label,
  required,
  className = '',
  placeholder = '',
  options,
  value,
  onChange,
}: SelectProps) {
  return (
    <FormField label={label} required={required} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
