"use client";

import { useEffect, useState } from "react";

export const TailwindIndicator = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-1 left-1 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 p-3 font-sans text-[9px] text-white">
      <div className="block sm:hidden">xs{width}</div>
      <div className="hidden sm:block md:hidden">sm{width}</div>
      <div className="hidden md:block lg:hidden">md{width}</div>
      <div className="hidden lg:block xl:hidden">lg{width}</div>
      <div className="hidden xl:block 2xl:hidden">xl{width}</div>
      <div className="hidden 2xl:block">2xl{width}</div>
    </div>
  );
};
