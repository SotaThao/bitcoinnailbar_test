import * as React from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

export const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
  ({ options, value, onChange, label, error, placeholder = "Select...", className = "" }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              w-full px-4 py-2.5 pr-10
              bg-white
              border-2 rounded-xl
              text-gray-900 text-base text-left
              cursor-pointer
              transition-all duration-200
              focus:outline-none
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 hover:border-[#F97316] focus:border-[#F97316] focus:ring-2 focus:ring-orange-100'
              }
              ${isOpen ? 'border-[#F97316] ring-2 ring-orange-100' : ''}
            `}
          >
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </button>

          {/* Chevron Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden"
              style={{ maxHeight: '240px', overflowY: 'auto' }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isFirst = index === 0;
                const isLast = index === options.length - 1;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-2.5 text-left text-base
                      transition-colors duration-150
                      flex items-center justify-between
                      ${isSelected 
                        ? 'bg-blue-100 text-blue-900 font-medium' 
                        : 'text-gray-900 hover:bg-orange-50 hover:text-orange-800'
                      }
                      ${isFirst ? 'rounded-t-xl' : ''}
                      ${isLast ? 'rounded-b-xl' : ''}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
