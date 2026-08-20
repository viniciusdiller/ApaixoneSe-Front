"use client";

import { CalendarIcon, Clock, X } from "lucide-react";
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

/** Valor no formato aceito por <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") */
type DateTimeLocalValue = string;

interface AdminDateTimeFieldProps {
  label: string;
  value: DateTimeLocalValue;
  onChange: (value: DateTimeLocalValue) => void;
  required?: boolean;
  minDate?: DateTimeLocalValue;
  error?: string;
}

function toLocalValue(d: Date): DateTimeLocalValue {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminDateTimeField({
  label,
  value,
  onChange,
  required,
  minDate,
  error,
}: AdminDateTimeFieldProps) {
  const selected = value ? new Date(value) : undefined;
  const minSelected = minDate ? new Date(minDate) : undefined;

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const base = selected ?? new Date();
    const merged = new Date(day);
    merged.setHours(base.getHours(), base.getMinutes(), 0, 0);
    onChange(toLocalValue(merged));
  };

  const handleTimeChange = (raw: string) => {
    const [h, m] = raw.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const base = selected ?? new Date();
    const merged = new Date(base);
    merged.setHours(h, m, 0, 0);
    onChange(toLocalValue(merged));
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
      <div className="flex gap-2">
        <div className="relative flex-1">
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

        <div className="relative w-[7.5rem] shrink-0">
          <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="time"
            value={selected ? format(selected, "HH:mm") : ""}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={!selected}
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 disabled:opacity-50",
              error && "border-red-400 focus:ring-red-400/40",
            )}
          />
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span aria-hidden="true">↳</span> {error}
        </p>
      )}
    </div>
  );
}
