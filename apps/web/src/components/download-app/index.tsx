import { DownloadCloud } from "lucide-react";

interface Props {
  className?: string;
}

export const DownloadApp = ({ className = "" }: Props) => {
  return (
    <a
      className="flex cursor-pointer items-center"
      href="https://github.com/cozeed/codro/releases"
      target="_blank"
      rel="noreferrer"
    >
      <DownloadCloud className={`size-4 animate-bounce ${className}`}></DownloadCloud>
    </a>
  );
};
