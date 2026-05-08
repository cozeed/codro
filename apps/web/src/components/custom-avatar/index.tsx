import clsx from "clsx";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

interface Props {
  image?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | number;
  shape?: "circle" | "rounded";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6 text-sm",
  md: "h-8 w-8 text-sm",
  lg: "h-16 w-16 text-2xl",
};

export const CustomAvatar = ({ image, name, size = "md", shape = "circle", className = "" }: Props) => {
  const sizeClass = typeof size === "number" ? `h-[${size}px] w-[${size}px]` : (sizeMap[size] ?? sizeMap["md"]);
  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-lg";
  const src = image?.trim() ? image : undefined;
  return (
    <Avatar className={clsx(sizeClass, roundedClass, className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className={clsx(roundedClass, className)}>{name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
    </Avatar>
  );
};
