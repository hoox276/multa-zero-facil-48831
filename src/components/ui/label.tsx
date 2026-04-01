import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, children, ...props }, ref) => {
  // Envolvendo texto específico 'em Minutos' para aplicar classe amarela
  const modifiedChildren = typeof children === 'string' ?
    children.replace(/em Minutos/g, '<span class="text-yellow-500">em Minutos</span>') :
    children;

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={typeof modifiedChildren === 'string' ? { __html: modifiedChildren } : undefined}
    >
      {typeof modifiedChildren !== 'string' && modifiedChildren}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };