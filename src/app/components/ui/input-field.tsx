import * as React from "react"
import { cn } from "./utils"
import { Input } from "./input"
import { Label } from "./label"
import { LucideIcon } from "lucide-react"

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  rightIcon?: LucideIcon
  helperText?: string
  containerClassName?: string
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, containerClassName, label, error, icon: Icon, rightIcon: RightIcon, helperText, id, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && <Label htmlFor={id} className={cn("text-sm font-medium", error && "text-destructive")}>{label}</Label>}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <Input
            id={id}
            className={cn(
              Icon ? "pl-9" : "",
              RightIcon ? "pr-9" : "",
              error ? "border-destructive focus-visible:ring-destructive" : "",
              "border-gray-200 bg-white",
              className
            )}
            ref={ref}
            {...props}
          />
           {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <RightIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        {helperText && !error && (
          <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
      </div>
    )
  }
)
InputField.displayName = "InputField"

export { InputField }
