import { Link, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, Building2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Building2, label: "Communities", href: "/admin/communities" },
    { icon: Users, label: "Users & Managers", href: "/admin/users" },
]

export default function AdminLayout() {
    const location = useLocation()

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 bg-gray-50/50 hidden md:block">
                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-black text-white"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 p-6">
                <Outlet />
            </div>
        </div>
    )
}
