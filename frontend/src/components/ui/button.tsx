import * as React from "react"

// Since I don't have radix/class-variance-authority installed yet, I'll use a simpler version for now
// and install clsx tailwind-merge if needed.
// Actually, let's stick to simple pure React + Tailwind for now to avoid dependency hell unless requested.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-black text-white shadow hover:bg-gray-800",
            outline: "border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-black",
            ghost: "hover:bg-gray-100 hover:text-black",
            link: "text-black underline-offset-4 hover:underline",
        }

        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
        }

        const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`

        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
