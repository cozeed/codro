import codro from "@/assets/codro.svg";

type Size = "small" | "middle" | "large";

interface Props {
  className?: string;
  size?: Size;
  url?: string;
}

const getTextSizeName = (size: Size) => {
  switch (size) {
    case "small":
      return "h-6";
    case "middle":
      return "h-8";
    case "large":
      return "h-10";
  }
};

export const Logo = ({ size = "small", className = "", url }: Props) => {
  return (
    <div
      className={`flex cursor-pointer items-center ${className}`}
      onClick={() => {
        if (url) {
          window.open(url, "_blank");
        }
      }}
    >
      <img className={`${getTextSizeName(size)}`} src={codro} alt="" />
    </div>
  );
};
