import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  disabled?: boolean;
  value?: string[];
  onChange?: (value: string[]) => void;
}

export const MultiSelect = ({ options, disabled, value = [], onChange }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    if (!onChange) return;

    const newValue = value.includes(selectedValue)
      ? value.filter((item) => item !== selectedValue)
      : [...value, selectedValue];

    onChange(newValue);
  };

  return (
    <div className="relative">
      <div
        className={`border rounded-md p-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {value.length > 0 ? value.join(", ") : "Select products"}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-md max-h-60 overflow-y-auto mt-2">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={() => handleSelect(option.value)}
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
