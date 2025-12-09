import { useMutation, useQuery } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CREATE_MAINTENANCE_REQUEST } from "@/graphql/mutations"
import { GET_MY_LEASE, GET_MY_REQUESTS } from "@/graphql/queries"
import { Clock, Home, Plus, Wrench } from "lucide-react"
import { useState } from "react"

export default function TenantMaintenance() {
    const { data: session } = authClient.useSession()
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("Medium")
    const [selectedUnitId, setSelectedUnitId] = useState("")

    // Fetch leases to get unit IDs
    const { data: leaseData, loading: leaseLoading } = useQuery<any>(GET_MY_LEASE, {
        variables: { filter: { tenant_id: (session?.user as any)?.linked_id, status: "Active" } },
        skip: !(session?.user as any)?.linked_id
    })

    const leases = leaseData?.leaseMany || []

    const { data, loading, error, refetch } = useQuery<any>(GET_MY_REQUESTS, {
        variables: {
            filter: {
                tenant_id: (session?.user as any)?.linked_id
            }
        },
        skip: !(session?.user as any)?.linked_id
    })

    const [createRequest, { loading: creating }] = useMutation(CREATE_MAINTENANCE_REQUEST, {
        onCompleted: () => {
            setIsCreating(false)
            setTitle("")
            setDescription("")
            refetch()
            alert("Maintenance request submitted successfully!")
        },
        onError: (err) => {
            alert(`Failed to submit request: ${err.message} `)
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Ensure we have a selected unit or fallback to first one if only one exists
        // But with the new UX, selectedUnitId should be set when opening the dialog
        const unitIdToUse = selectedUnitId || leases[0]?.unit?._id

        if (!session?.user.id || !unitIdToUse) {
            alert("Could not find your unit information. Please ensure you have an active lease.")
            return
        }

        try {
            await createRequest({
                variables: {
                    record: {
                        tenant_id: (session.user as any).linked_id,
                        apartment_id: unitIdToUse,
                        issue_description: `${title} - ${description} `,
                        priority,
                        status: "Open",
                    }
                }
            })
        } catch (err) {
            console.error("Failed to create request:", err)
        }
    }

    if (loading || leaseLoading) return <div className="flex justify-center p-8">Loading requests...</div>
    if (error) return <div className="text-red-500 p-8">Error loading requests: {error.message}</div>

    const requests = data?.maintenanceMany || []

    // Helper to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700'
            case 'In Progress': return 'bg-yellow-100 text-yellow-700'
            case 'Resolved': return 'bg-green-100 text-green-700'
            case 'Closed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const renderLeaseSection = (lease: any) => {
        // Filter requests for this unit
        const unitRequests = requests.filter((r: any) => r.unit?._id === lease.unit?._id)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const activeCount = unitRequests.filter((r: any) => r.status !== 'Resolved' && r.status !== 'Closed').length

        return (
            <div key={lease._id} className="space-y-6 border border-gray-200 rounded-xl p-6 bg-white/50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Home className="h-5 w-5 text-gray-500" />
                        Unit {lease.unit?.apartment_no} - {lease.unit?.community?.name}
                    </h2>
                    <Button onClick={() => {
                        setSelectedUnitId(lease.unit._id)
                        setIsCreating(true)
                    }} className="gap-2">
                        <Plus className="h-4 w-4" /> New Request
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeCount}</div>
                            <p className="text-xs text-gray-500 mt-1">Pending resolution</p>
                        </CardContent>
                    </Card>
                    {/* Could add more stats here like "Last Request Date" etc */}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Wrench className="h-4 w-4" /> Request History
                    </h3>

                    {unitRequests.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg text-gray-500">
                            No maintenance requests found for this unit.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {unitRequests.map((request: any) => (
                                <Card key={request._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start gap-4 pt-4">
                                            <div className="space-y-1">
                                                <div className="font-semibold flex items-center gap-2">
                                                    {request.description?.split(' - ')[0]}
                                                    <span className={`text-[10px] px-2 py-0.5 border border-gray-200 rounded-full uppercase tracking-wider font-bold ${request.priority === 'Emergency' ? 'bg-red-100 text-red-700' :
                                                        request.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                            request.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        } `}>
                                                        {request.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {request.description?.split(' - ')[1] || request.description}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                                                    <Clock className="h-3 w-3" />
                                                    Reported on {formatDate(request.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(request.status)} `}>
                                                    {request.status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // If no lease, show empty state
    if (leases.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">No Active Leases</h2>
                    <p className="text-gray-500">You need an active lease to submit maintenance requests.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>

            {leases.map(renderLeaseSection)}

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Submit New Request</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            {/* Read-only input or disabled select since it is pre-selected */}
                            <Select value={selectedUnitId} disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {leases.map((lease: any) => (
                                        <SelectItem key={lease.unit._id} value={lease.unit._id}>
                                            Unit {lease.unit.apartment_no} ({lease.unit.community.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Issue Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Leaky Faucet"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Provide more details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creating}>
                                {creating ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
