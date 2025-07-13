import { useEffect, useState } from "react";

export function useBoardSize() {
  const [size, setSize] = useState(600);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setSize(370); // Mobile
      } else if (width < 1024) {
        setSize(600); // Tablet
      } else {
        setSize(700); // Desktop
      }
    };

    updateSize(); // Set initially
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
