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
  { label, error, multiline, rows = 3, mask, onChange, type, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  const base =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (onChange) {
      onChange(mask ? mask(e.target.value) : e.target.value);
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          className={`${base} resize-none`}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          onChange={handleChange}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <div className="relative">
          <input
            type={inputType}
            className={`${base} ${isPassword ? "pr-10" : ""}`}
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
