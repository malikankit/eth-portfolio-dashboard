import { todayIsoDate } from "@/lib/format";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
      Portfolio date
      <input
        type="date"
        value={value}
        max={todayIsoDate()}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  );
}
