import * as React from "react";
import { cn } from "@/src/lib/cn";

export type CardLayer = 1 | 2 | 3 | "inset";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  layer?: CardLayer;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const LAYER_CLASSES: Record<CardLayer, string> = {
  1: "ps-layer-1",
  2: "ps-layer-2",
  3: "ps-layer-3",
  inset: "ps-inset",
};

const PADDING_CLASSES: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3.5 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

// Superficie modular respetando las capas de profundidad del Anexo B.1
export function Card({
  layer = 1,
  interactive = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--ps-radius-xl)]",
        LAYER_CLASSES[layer],
        PADDING_CLASSES[padding],
        interactive && "ps-pressable",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-[var(--ps-text)]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-relaxed text-[var(--ps-text-secondary)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--ps-border)] pt-3.5", className)}
      {...props}
    />
  );
}
