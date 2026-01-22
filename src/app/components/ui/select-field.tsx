import * as React from "react"
import { cn } from "./utils"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends React.ComponentProps<typeof Select> {
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  containerClassName?: string
  triggerClassName?: string
  options?: SelectOption[]
  children?: React.ReactNode
  id?: string
}

const SelectField = ({
  label,
  placeholder,
  error,
  helperText,
  containerClassName,
  triggerClassName,
  options,
  children,
  id,
  ...props
}: SelectFieldProps) => {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && <Label htmlFor={id} className={cn("text-sm font-medium", error && "text-destructive")}>{label}</Label>}
      <Select {...props}>
        <SelectTrigger
          id={id}
          className={cn(
            "!rounded-full !h-9 !py-1",
            error ? "border-destructive focus:ring-destructive" : "border-gray-200 bg-white",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options ? (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            children
          )}
        </SelectContent>
      </Select>
      {helperText && !error && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}

export { SelectField }