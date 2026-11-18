import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium ring-offset-card transition-[color,background-color,border-color,transform] duration-150 ease-out motion-safe:enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-emerald-800",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-red-800",
				outline:
					"border-slate-500 bg-slate-800/75 text-white hover:bg-slate-700/80",
				secondary: "bg-secondary text-secondary-foreground hover:bg-slate-600",
				ghost: "text-slate-300 hover:bg-slate-700/60 hover:text-white",
				link: "text-sky-300 underline-offset-4 hover:underline",
			},
			size: {
				default: "min-h-10 px-4 py-2",
				sm: "min-h-9 rounded-md px-3",
				lg: "min-h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
