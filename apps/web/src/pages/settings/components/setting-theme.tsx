import { useId } from "react";
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";

const items = [
  { value: "1", label: "light", image: "/ui-light.png" },
  { value: "2", label: "dark", image: "/ui-dark.png" },
  { value: "3", label: "system", image: "/ui-system.png" },
];

export const SettingTheme = () => {
  const { setTheme, theme } = useTheme();
  const id = useId();
  const getThemeValue = (label: string | undefined) => {
    const item = items.find((item) => item.label === label);
    return item ? item.value : "3";
  };
  return (
    <RadioGroup className="flex gap-4" defaultValue={getThemeValue(theme)}>
      {items.map((item) => (
        <label key={`${id}-${item.value}`} className="flex flex-col items-center">
          <RadioGroupItem
            id={`${id}-${item.value}`}
            value={item.value}
            className="peer sr-only after:absolute after:inset-0"
            onClick={() => {
              setTheme(item.label);
            }}
          />
          <img
            src={item.image}
            alt={item.label}
            width={140}
            height={120}
            className="border-muted relative cursor-pointer overflow-hidden rounded-xl border-2 p-1 shadow-sm shadow-black/5 transition-colors peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-slate-100 hover:bg-slate-100"
          />
          <span className="group peer-data-[state=unchecked]:text-muted-foreground mt-2 flex items-center gap-1 peer-data-[state=checked]:text-blue-500">
            <span className="text-xs font-medium">{item.label}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
};
