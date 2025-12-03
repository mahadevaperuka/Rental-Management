import { useQuery } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Home, Users, UserCheck } from "lucide-react"
import { GET_ADMIN_STATS } from "@/graphql/queries"

export default function AdminOverview() {
    const { data, loading, error } = useQuery<any>(GET_ADMIN_STATS)

    if (loading) return <div className="flex justify-center p-8">Loading stats...</div>
    if (error) return <div className="text-red-500 p-8">Error loading stats: {error.message}</div>

    const stats = [
        {
            title: "Total Communities",
            value: data?.communityCount || 0,
            icon: Building2,
            description: "Managed properties",
            color: "text-blue-600 bg-blue-50"
        },
        {
            title: "Total Units",
            value: data?.unitCount || 0,
            icon: Home,
            description: "Apartments across all communities",
            color: "text-green-600 bg-green-50"
        },
        {
            title: "Active Tenants",
            value: data?.tenantCount || 0,
            icon: Users,
            description: "Currently leasing",
            color: "text-purple-600 bg-purple-50"
        },
        {
            title: "Total Users",
            value: data?.userCount || 0,
            icon: UserCheck,
            description: "Registered system users",
            color: "text-orange-600 bg-orange-50"
        }
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
