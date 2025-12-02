import { Link, Outlet, useLocation } from "react-router-dom"
import { ClipboardList, Wrench, Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"

const GET_MY_COMMUNITY = gql`
  query GetMyCommunity($id: MongoID!) {
    managerById(_id: $id) {
      community {
        name
        location
      }
    }
  }
`

const sidebarItems = [
    { icon: ClipboardList, label: "Applications", href: "/manager" },
    { icon: Wrench, label: "Maintenance", href: "/manager/maintenance" },
    { icon: Users, label: "Tenants", href: "/manager/tenants" },
]

export default function ManagerLayout() {
    const location = useLocation()
    const { data: session } = authClient.useSession()

    const { data } = useQuery<any>(GET_MY_COMMUNITY, {
        variables: { id: (session?.user as any)?.linked_id },
        skip: !(session?.user as any)?.linked_id
    })

    const communityName = data?.managerById?.community?.name

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 bg-gray-50/50 hidden md:block flex flex-col">
                {communityName && (
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            {communityName}
                        </div>
                    </div>
                )}
                <nav className="p-4 space-y-1 flex-1">
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
