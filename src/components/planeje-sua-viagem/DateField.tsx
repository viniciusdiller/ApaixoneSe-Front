"use client";

import { CalendarIcon } from "lucide-react";
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

/** Faixa de anos aceita (o backend rejeita fora dela) */
const ANO_MIN = 2000;
const ANO_MAX = 2100;

/** Valor "YYYY-MM-DD". Só é possível escolher pelo calendário: não há digitação livre do ano. */
interface DateFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

function toValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDate(v: string) {
  return new Date(`${v}T00:00:00`);
}

export function DateField({
  id,
  value,
  onChange,
  min,
  max,
  required,
  placeholder = "Selecionar data",
  ariaLabel,
}: DateFieldProps) {
  const selected = value ? toDate(value) : undefined;
  const minDate = min ? toDate(min) : undefined;
  const maxDate = max ? toDate(max) : undefined;

  const startMonth = minDate
    ? new Date(Math.max(minDate.getFullYear(), ANO_MIN), 0)
    : new Date(ANO_MIN, 0);
  const endMonth = maxDate
    ? new Date(Math.min(maxDate.getFullYear(), ANO_MAX), 11)
    : new Date(ANO_MAX, 11);

  return (
    <Popover>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-label={ariaLabel}
            className={cn(
              "h-auto w-full justify-start gap-2 rounded-xl px-4 py-2.5 font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
            {selected
              ? format(selected, "dd/MM/yyyy", { locale: ptBR })
              : placeholder}
          </Button>
        </PopoverTrigger>
        {/* Campo invisível só para o navegador validar "obrigatório" no submit */}
        {required && (
          <input
            tabIndex={-1}
            aria-hidden="true"
            required
            value={value}
            onChange={() => {}}
            className="pointer-events-none absolute inset-0 opacity-0"
          />
        )}
      </div>
      {/* z acima do modal do plano (z-[70]) */}
      <PopoverContent className="z-[80] w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => day && onChange(toValue(day))}
          defaultMonth={selected ?? minDate}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateTimeFieldProps {
  id?: string;
  /** "YYYY-MM-DDTHH:mm" */
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
}

/** Data pelo calendário + hora no seletor nativo (hora não tem o problema do ano) */
export function DateTimeField({
  id,
  value,
  onChange,
  min,
  max,
  required,
}: DateTimeFieldProps) {
  const [dia = "", hora = ""] = value.split("T");

  return (
    <div className="grid grid-cols-[1fr_7.5rem] gap-3">
      <DateField
        id={id}
        value={dia}
        min={min}
        max={max}
        required={required}
        ariaLabel="Data"
        onChange={(d) => onChange(`${d}T${hora || "09:00"}`)}
      />
      <input
        type="time"
        aria-label="Hora"
        required={required}
        value={hora}
        onChange={(e) => onChange(`${dia}T${e.target.value}`)}
        className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
