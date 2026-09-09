import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapContext(scope?: React.RefObject<HTMLElement | null>) {
  const ctx = useRef<gsap.Context>();

  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {}, scope);
    return () => ctx.current?.revert();
  }, [scope]);

  return ctx;
}
