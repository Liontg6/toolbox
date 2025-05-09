// useURLMode.ts
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const useURLMode = <T extends string>(modes: T[], defaultMode: T, param: string = "mode") => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const initialMode = searchParams.get(param) ?? defaultMode;
  const [mode, setMode] = useState<T>(modes.includes(initialMode as T) ? initialMode as T : defaultMode);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, mode);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [mode, pathname, replace, searchParams, param]);

  const toggleMode = () => {
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  const setModeByValue = (newMode: T) => {
    if (modes.includes(newMode)) {
      setMode(newMode);
    } else {
      console.error(`Invalid mode: ${newMode}. Mode must be one of: ${modes.join(', ')}`);
    }
  };

  return { mode, toggleMode, setMode: setModeByValue, modes };
};

export default useURLMode;