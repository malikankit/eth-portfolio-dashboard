interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function AddressInput({ value, onChange }: AddressInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
      Ethereum address
      <input
        type="text"
        placeholder="0x..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  );
}
