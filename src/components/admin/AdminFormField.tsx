import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AdminFormFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
  "onChange"
> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  mask?: (value: string) => string;
  onChange?: (value: string) => void;
}

export const AdminFormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  AdminFormFieldProps
>(function AdminFormField(
  { label, error, multiline, rows = 3, mask, onChange, type, maxLength, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  const base =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-150";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const rawValue = mask ? mask(e.target.value) : e.target.value;
    const nextValue =
      typeof maxLength === "number" && rawValue.length > maxLength
        ? rawValue.slice(0, maxLength)
        : rawValue;
    if (onChange) {
      onChange(nextValue);
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const valueLength =
    typeof props.value === "string" ? props.value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {props.required && (
          <span className="text-red-400" aria-hidden="true">*</span>
        )}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          maxLength={maxLength}
          className={`${base} resize-none ${error ? "border-red-400 focus:ring-red-400/40" : ""}`}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          onChange={handleChange}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <div className="relative">
          <input
            type={inputType}
            maxLength={maxLength}
            className={`${base} ${isPassword ? "pr-10" : ""} ${error ? "border-red-400 focus:ring-red-400/40" : ""}`}
            ref={ref as React.Ref<HTMLInputElement>}
            onChange={handleChange}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
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
      {typeof maxLength === "number" && (
        <div className="flex justify-end text-[10px] text-muted-foreground">
          <span>
            {valueLength}/{maxLength}
          </span>
        </div>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span aria-hidden="true">↳</span> {error}
        </p>
      )}
    </div>
  );
});
