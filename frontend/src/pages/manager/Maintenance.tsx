import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GET_MAINTENANCE_REQUESTS } from "@/graphql/queries"
import { UPDATE_MAINTENANCE_STATUS } from "@/graphql/mutations"

export default function ManagerMaintenance() {
    const { data, loading, error, refetch } = useQuery<any>(GET_MAINTENANCE_REQUESTS)
    const [updateStatus, { loading: updating }] = useMutation(UPDATE_MAINTENANCE_STATUS, {
        onCompleted: () => refetch()
    })

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateStatus({
                variables: { id, status: newStatus }
            })
        } catch (err) {
            console.error("Failed to update status:", err)
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading requests...</div>
    if (error) return <div className="text-red-500 p-8">Error loading requests: {error.message}</div>

    const requests = [...(data?.maintenanceMany || [])].sort((a: any, b: any) =>
        new Date(b.reported_date).getTime() - new Date(a.reported_date).getTime()
    )

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500">No maintenance requests found.</p>
                    </div>
                ) : (
                    requests.map((req: any) => (
                        <Card key={req._id}>
                            <CardContent className="p-6 pt-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{req.issue_description}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${req.priority === 'High' || req.priority === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200' :
                                                req.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {req.priority}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-500">
                                            <div>
                                                <span className="font-medium text-gray-700">Location:</span> {req.unit?.community?.name}, Unit {req.unit?.apartment_no}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Reported:</span> {new Date(req.reported_date).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Tenant:</span> {req.tenant?.name} ({req.tenant?.phone})
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-48">
                                        <Select
                                            defaultValue={req.status}
                                            onValueChange={(value: string) => handleStatusChange(req._id, value)}
                                            disabled={updating}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="In_Progress">In Progress</SelectItem>
                                                <SelectItem value="Resolved">Resolved</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
