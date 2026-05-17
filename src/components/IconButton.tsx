import type { ComponentType, SVGProps } from "react";
import { cn } from "@/utils/format";

type Props = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  className?: string;
  active?: boolean;
};

export function IconButton({ label, icon: Icon, onClick, className, active }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "focus-ring grid size-10 place-items-center rounded-full border border-white/20 bg-black/55 text-white transition hover:scale-105 hover:border-white/60 hover:bg-white hover:text-black",
        active && "border-brand bg-brand text-white hover:bg-brand hover:text-white",
        className
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
