import * as RadixSwitch from "@radix-ui/react-switch";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/**
 * Accessible on/off switch (Radix UI).
 * Reads as a real switch to assistive tech and is keyboard-operable,
 * which a styled <div> with an onClick would not be.
 */
export function Switch({ checked, onCheckedChange, label, disabled }: Props) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        bg-line transition-colors data-[state=checked]:bg-brand
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RadixSwitch.Thumb
        className="block h-5 w-5 rounded-full bg-white shadow transition-transform
          data-[state=checked]:translate-x-5"
      />
    </RadixSwitch.Root>
  );
}
