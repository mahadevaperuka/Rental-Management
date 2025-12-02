import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Phone, Mail, Home } from "lucide-react"

const GET_TENANTS = gql`
  query GetTenants {
    tenantMany {
      _id
      name
      email
      phone
      joined_date
      lease {
        _id
        start_date
        end_date
        status
        unit {
            _id
            apartment_no
            community {
                _id
                name
            }
        }
      }
    }
  }
`

export default function ManagerTenants() {
    const { data, loading, error } = useQuery<any>(GET_TENANTS)

    if (loading) return <div className="flex justify-center p-8">Loading tenants...</div>
    if (error) return <div className="text-red-500 p-8">Error loading tenants: {error.message}</div>

    const tenants = data?.tenantMany || []

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Tenant Directory</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Tenants
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-100">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Unit</th>
                                    <th className="px-4 py-3">Lease Status</th>
                                    <th className="px-4 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No tenants found.</td>
                                    </tr>
                                ) : (
                                    tenants.map((tenant: any) => (
                                        <tr key={tenant._id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium">{tenant.name}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Mail className="h-3 w-3" /> {tenant.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                                    <Phone className="h-3 w-3" /> {tenant.phone}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {tenant.lease?.unit ? (
                                                    <div>
                                                        <div className="font-medium flex items-center gap-1">
                                                            <Home className="h-3 w-3 text-gray-400" />
                                                            Unit {tenant.lease.unit.apartment_no}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{tenant.lease.unit.community.name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">No Unit Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {tenant.lease ? (
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${tenant.lease.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                            'bg-gray-50 text-gray-700 ring-gray-600/20'
                                                        }`}>
                                                        {tenant.lease.status}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(tenant.joined_date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
