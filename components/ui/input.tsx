import React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  showCount?: boolean
  maxLength?: number
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, error, showCount, maxLength, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="relative w-full">
        {/* Input Container */}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-orange-50 px-3 py-2 text-sm",
              "border-amber-200 text-amber-900 ring-offset-orange-50",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-amber-900",
              "placeholder:text-amber-500/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-amber-300 transition-colors",
              icon && "pl-10",
              error && "border-red-300 focus-visible:ring-red-400",
              className
            )}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
          {showCount && maxLength && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-600">
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }