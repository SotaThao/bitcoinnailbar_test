import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "./utils"
import { Input } from "./input"

const SearchInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          className={cn(
            "pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:border-orange-500 focus-visible:ring-orange-200 w-full",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
