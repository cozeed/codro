import { useEffect, useState, type RefObject } from "react";

export function useIsVisible(ref: RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setIsVisible(entry.isIntersecting);
      }
    });

    const current = ref.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [ref]);

  return { isVisible };
}
