import { MainHeader } from "../main-header";
import { MainTree } from "../main-tree";

interface Props {
  tabIndex?: number;
  className?: string;
}

export const MainSidebar = ({ tabIndex, className }: Props) => {
  return (
    <div tabIndex={tabIndex} className={`flex flex-col ${className}`}>
      <MainHeader />
      <MainTree />
    </div>
  );
};
