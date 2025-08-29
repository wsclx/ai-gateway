import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-100 text-blue-800 border-blue-200",
      secondary: "bg-gray-100 text-gray-800 border-gray-200",
      destructive: "bg-red-100 text-red-800 border-red-200",
      outline: "border border-gray-300 text-gray-700"
    }
    
    return (
      <div
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-ring-offset-2 ${variantClasses[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
