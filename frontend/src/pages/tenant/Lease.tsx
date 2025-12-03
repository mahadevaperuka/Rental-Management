import { useQuery } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, FileText, Home } from "lucide-react"
import { GET_MY_LEASE } from "@/graphql/queries"

export default function TenantLease() {
    const { data: session } = authClient.useSession()
    const { data, loading, error } = useQuery<any>(GET_MY_LEASE, {
        variables: {
            filter: {
                tenant_id: (session?.user as any)?.linked_id
            }
        },
        skip: !(session?.user as any)?.linked_id
    })

    if (loading) return <div className="flex justify-center p-8">Loading lease details...</div>
    if (error) return <div className="text-red-500 p-8">Error loading lease: {error.message}</div>

    // Since we're using leaseMany, we take the first active lease
    const lease = data?.leaseMany?.[0]

    if (!lease) {
        return (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">No Active Lease Found</h2>
                <p className="text-gray-500">You don't currently have an active lease associated with your account.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">My Lease</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Property Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Community</p>
                            <p className="text-lg font-semibold">{lease.unit?.community?.name}</p>
                            <p className="text-gray-500">{lease.unit?.community?.location}</p>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Unit</p>
                                <p className="text-lg">{lease.unit?.apartment_no}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Layout</p>
                                <p className="text-lg">{lease.unit?.bedrooms} Bed / {lease.unit?.bathrooms} Bath</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Lease Terms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Start Date
                                </p>
                                <p>{new Date(lease.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> End Date
                                </p>
                                <p>{new Date(lease.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <CreditCard className="h-3 w-3" /> Monthly Rent
                            </p>
                            <p className="text-2xl font-bold">${lease.monthly_rent}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-black text-white shadow hover:bg-black/80">
                                {lease.status}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
