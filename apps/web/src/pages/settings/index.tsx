import { useAtom } from "jotai";
import { Brain, Languages, Palette, User } from "lucide-react";
import { activeTitleAtom } from "@/store/jotai";

import { SettingsAppearancePage } from "./appearance";
import { SidebarNav } from "./components/sidebar-nav";
import { SettingsLanguagePage } from "./language";
import { SettingsProfilePage } from "./profile";
import { SettingsProviderPage } from "./provider";

const sidebarNavItems = [
  {
    title: "Profile",
    icon: <User size={20} />,
    component: <SettingsProfilePage />,
  },
  {
    title: "Language",
    icon: <Languages size={20} />,
    component: <SettingsLanguagePage />,
  },
  {
    title: "Appearance",
    icon: <Palette size={20} />,
    component: <SettingsAppearancePage />,
  },
  {
    title: "Provider",
    icon: <Brain size={20} />,
    component: <SettingsProviderPage />,
  },
];

export const SettingsPage = () => {
  const [activeTitle, setActiveTitle] = useAtom(activeTitleAtom);

  const getComponentByTitle = (title: string) => {
    const item = sidebarNavItems.find((item) => item.title.toLowerCase() === title.toLowerCase());
    return item ? item.component : null;
  };

  return (
    <>
      <div className="bg-background h-full w-full md:block">
        <div className="flex h-full flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="top-0 w-full lg:sticky lg:mr-0 lg:w-50 lg:border-r">
            <SidebarNav items={sidebarNavItems} activeTitle={activeTitle} setActiveTitle={setActiveTitle} />
          </aside>

          <div className="flex-1 overflow-y-hidden lg:max-w-3xl">{getComponentByTitle(activeTitle)}</div>
        </div>
      </div>
    </>
  );
};
