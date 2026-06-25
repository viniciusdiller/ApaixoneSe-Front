import React from "react";

interface PerfilFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  as?: "input" | "textarea" | "select";
  options?: { label: string; value: string }[];
}

export function PerfilFormField({ 
  label, 
  as = "input", 
  options, 
  className, 
  ...rest 
}: PerfilFormFieldProps) {
  // Classes padrão do Tailwind para deixar o input com um design moderno e limpo
  const baseClasses = "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      
      {as === "textarea" ? (
        <textarea 
          className={`${baseClasses} min-h-[120px] resize-y`} 
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} 
        />
      ) : as === "select" ? (
        <select 
          className={baseClasses} 
          {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          <option value="" disabled>Selecione uma opção...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input 
          className={baseClasses} 
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} 
        />
      )}
    </div>
  );
}