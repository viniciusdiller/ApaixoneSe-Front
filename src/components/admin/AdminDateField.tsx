"use client";

import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MAX_YEAR = 2999;

/** Valor no formato "YYYY-MM-DD" */
type DateValue = string;

interface AdminDateFieldProps {
  label: string;
  value: DateValue;
  onChange: (value: DateValue) => void;
  required?: boolean;
  minDate?: DateValue;
  error?: string;
}

function toDateValue(d: Date): DateValue {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AdminDateField({
  label,
  value,
  onChange,
  required,
  minDate,
  error,
}: AdminDateFieldProps) {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  const minSelected = minDate ? new Date(`${minDate}T00:00:00`) : undefined;

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    onChange(toDateValue(day));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && (
          <span className="text-red-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 font-normal",
                !required && selected && "pr-8",
                !selected && "text-muted-foreground",
                error && "border-red-400",
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {selected
                ? format(selected, "dd/MM/yyyy", { locale: ptBR })
                : "Selecionar data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleDaySelect}
              defaultMonth={selected}
              captionLayout="dropdown"
              startMonth={new Date(2000, 0)}
              endMonth={new Date(MAX_YEAR, 11)}
              disabled={minSelected ? { before: minSelected } : undefined}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        {!required && selected && (
          <button
            type="button"
            onClick={() => onChange("")}
            title="Limpar"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span aria-hidden="true">↳</span> {error}
        </p>
      )}
    </div>
  );
}
