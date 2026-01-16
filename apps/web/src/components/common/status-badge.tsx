import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        // Aircraft status
        serviceable: "bg-serviceable text-serviceable",
        maintenance: "bg-maintenance text-maintenance",
        grounded: "bg-grounded text-grounded",
        retired: "bg-retired text-retired",
        // Component status
        "in-stock": "bg-component-in-stock-bg text-component-in-stock",
        installed: "bg-component-installed-bg text-component-installed",
        removed: "bg-component-removed-bg text-component-removed",
        scrapped: "bg-component-scrapped-bg text-component-scrapped",
        // Generic
        default: "bg-muted text-muted-foreground",
      },
    },
  },
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
}

export function StatusBadge({
  variant,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  // Default labels for each variant
  const defaultLabels: Record<string, string> = {
    serviceable: "可用",
    maintenance: "维护中",
    grounded: "停飞",
    retired: "退役",
    "in-stock": "在库",
    installed: "已装机",
    removed: "已拆下",
    scrapped: "已报废",
  }

  const displayLabel = label || defaultLabels[variant || ""] || ""

  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {displayLabel}
    </div>
  )
}

// Specific badge components for better IDE support
export function AircraftStatusBadge({
  status,
  label,
  ...props
}: { status: "SERVICEABLE" | "MAINTENANCE" | "GROUNDED" | "RETIRED"; label?: string } & Omit<StatusBadgeProps, "variant">) {
  const variantMap = {
    SERVICEABLE: "serviceable" as const,
    MAINTENANCE: "maintenance" as const,
    GROUNDED: "grounded" as const,
    RETIRED: "retired" as const,
  }

  return <StatusBadge variant={variantMap[status]} label={label} {...props} />
}

export function ComponentStatusBadge({
  status,
  label,
  ...props
}: { status: "IN_STOCK" | "INSTALLED" | "REMOVED" | "SCRAPPED"; label?: string } & Omit<StatusBadgeProps, "variant">) {
  const variantMap = {
    IN_STOCK: "in-stock" as const,
    INSTALLED: "installed" as const,
    REMOVED: "removed" as const,
    SCRAPPED: "scrapped" as const,
  }

  return <StatusBadge variant={variantMap[status]} label={label} {...props} />
}
