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

    // Since we're using leaseMany, filter for active and history
    const leases = data?.leaseMany || [];
    const activeLeases = leases.filter((l: any) => l.status === 'Active');
    const inactiveLeases = leases.filter((l: any) => l.status !== 'Active');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">My Lease</h1>

            {/* Active Leases Section */}
            {activeLeases.length > 0 ? (
                <div className="space-y-8 mb-8">
                    {activeLeases.map((activeLease: any) => (
                        <div key={activeLease._id} className="border border-green-200 rounded-xl p-6 bg-green-50/30">
                            <h2 className="text-xl font-semibold mb-4 text-green-900 flex items-center gap-2">
                                <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                                Active Lease: {activeLease.unit?.community?.name}
                            </h2>
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
                                            <p className="text-lg font-semibold">{activeLease.unit?.community?.name}</p>
                                            <p className="text-gray-500">{activeLease.unit?.community?.location}</p>
                                        </div>
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Unit</p>
                                                <p className="text-lg">{activeLease.unit?.apartment_no}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Layout</p>
                                                <p className="text-lg">{activeLease.unit?.bedrooms} Bed / {activeLease.unit?.bathrooms} Bath</p>
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
                                                <p>{new Date(activeLease.start_date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> End Date
                                                </p>
                                                <p>{new Date(activeLease.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                <CreditCard className="h-3 w-3" /> Monthly Rent
                                            </p>
                                            <p className="text-2xl font-bold">${activeLease.monthly_rent}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Status</p>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white shadow">
                                                {activeLease.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-2">No Active Lease Found</h2>
                    <p className="text-gray-500">You don't currently have an active lease associated with your account.</p>
                </div>
            )}

            {/* Lease History Section */}
            {inactiveLeases.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Lease History</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {inactiveLeases.map((lease: any) => (
                            <Card key={lease._id} className="bg-gray-50/50 opacity-80 hover:opacity-100 transition-opacity">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium flex items-center justify-between">
                                        <span>{lease.unit?.community?.name} - Unit {lease.unit?.apartment_no}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${lease.status === 'Terminated' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                                            }`}>
                                            {lease.status}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Period:</span>
                                        <span>{new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Rent:</span>
                                        <span>${lease.monthly_rent}/mo</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
