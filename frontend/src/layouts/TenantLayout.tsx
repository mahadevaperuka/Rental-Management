import { Link, Outlet, useLocation } from "react-router-dom"
import { Search, FileText, CreditCard, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { icon: Search, label: "Find Home", href: "/tenant" },
    { icon: FileText, label: "My Lease", href: "/tenant/lease" },
    { icon: CreditCard, label: "Payments", href: "/tenant/payments" },
    { icon: Wrench, label: "Maintenance", href: "/tenant/maintenance" },
]

export default function TenantLayout() {
    const location = useLocation()

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Sub-navigation for Tenants (Tabs style) */}
            <div className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                        isActive
                                            ? "border-black text-black"
                                            : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    )
}
