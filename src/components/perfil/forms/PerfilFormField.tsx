import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Trocamos o nome da Interface
interface PerfilFormFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
  "onChange"
> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  mask?: (value: string) => string;
  onChange?: (value: string) => void;
  showCharCount?: boolean;
}

// Trocamos o nome da Função
export const PerfilFormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PerfilFormFieldProps
>(function PerfilFormField(
  {
    label,
    error,
    multiline,
    rows = 3,
    mask,
    onChange,
    type,
    showCharCount = false,
    ...props
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(true);
      props.onFocus?.(e as any);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false);
      props.onBlur?.(e as any);
    },
  };

  const base =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (onChange) {
      onChange(mask ? mask(e.target.value) : e.target.value);
    }
  };

  const displayValue =
    mask && typeof props.value === "string" ? mask(props.value) : props.value;

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const valueLength = typeof displayValue === "string" ? displayValue.length : 0;

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label.replace(/\s*\*\s*$/, '')}
        {props.required && (
          <span className="text-red-500" aria-hidden="true">*</span>
        )}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          className={`${base} resize-none`}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          onChange={handleChange}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          {...focusHandlers}
          value={displayValue}
        />
      ) : (
        <div className="relative">
          <input
            type={inputType}
            className={`${base} ${isPassword ? "pr-10" : ""}`}
            ref={ref as React.Ref<HTMLInputElement>}
            onChange={handleChange}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            {...focusHandlers}
            value={displayValue}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
              title={showPassword ? "Ocultar senha" : "Ver senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}
      {showCharCount && typeof props.maxLength === "number" && (
        <div
          className={`flex justify-end text-[10px] overflow-hidden transition-all duration-200 ease-in-out ${valueLength >= props.maxLength - 10 ? "text-red-500 font-medium" : "text-muted-foreground"}`}
          style={{ opacity: focused ? 1 : 0, maxHeight: focused ? "1.25rem" : "0" }}
        >
          <span>{valueLength}/{props.maxLength}</span>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});