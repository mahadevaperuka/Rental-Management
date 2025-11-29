import { gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wrench, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

// Query to get user's unit ID from their lease
const GET_MY_UNIT_ID = gql`
  query GetMyUnitId($filter: FilterFindManyLeaseInput) {
    leaseMany(filter: $filter) {
      _id
      unit {
        _id
      }
    }
  }
`

const GET_MY_REQUESTS = gql`
  query GetMyMaintenanceRequests($filter: FilterFindManyMaintenanceInput) {
    maintenanceMany(filter: $filter) {
      _id
      title: issue_description
      description: issue_description
      status
      priority
      createdAt: reported_date
    }
  }
`

const CREATE_REQUEST = gql`
  mutation CreateMaintenanceRequest($record: CreateOneMaintenanceInput!) {
    maintenanceCreateOne(record: $record) {
      record {
        _id
        issue_description
        status
      }
    }
  }
`

export default function TenantMaintenance() {
    const { data: session } = authClient.useSession()
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState("") // Using this as description since schema only has issue_description
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("Medium")

    // Fetch unit ID first
    const { data: leaseData } = useQuery<any>(GET_MY_UNIT_ID, {
        variables: { filter: { tenant_id: (session?.user as any)?.linked_id, status: "Active" } },
        skip: !session?.user.id
    })
    const unitId = leaseData?.leaseMany?.[0]?.unit?._id

    const { data, loading, error, refetch } = useQuery<any>(GET_MY_REQUESTS, {
        variables: {
            filter: {
                tenant_id: (session?.user as any)?.linked_id
            }
        },
        skip: !session?.user.id
    })

    const [createRequest, { loading: creating }] = useMutation(CREATE_REQUEST, {
        onCompleted: () => {
            setIsCreating(false)
            setTitle("")
            setDescription("")
            refetch()
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.user.id || !unitId) {
            alert("Could not find your unit information. Please ensure you have an active lease.")
            return
        }

        try {
            await createRequest({
                variables: {
                    record: {
                        tenant_id: (session.user as any).linked_id,
                        apartment_id: unitId,
                        issue_description: `${title} - ${description}`, // Combine for now as schema has one field
                        priority,
                        status: "Open",
                    }
                }
            })
        } catch (err) {
            console.error("Failed to create request:", err)
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading requests...</div>
    if (error) return <div className="text-red-500 p-8">Error loading requests: {error.message}</div>

    const requests = data?.maintenanceMany || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
                <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
                    {isCreating ? "Cancel" : <><Plus className="h-4 w-4" /> New Request</>}
                </Button>
            </div>

            {isCreating && (
                <Card className="border-black/10 shadow-md">
                    <CardHeader>
                        <CardTitle>Submit New Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                                    placeholder="Describe the issue in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={creating}>
                                {creating ? "Submitting..." : "Submit Request"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {requests.length === 0 && !isCreating ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500">No maintenance requests found.</p>
                    </div>
                ) : (
                    requests.map((req: any) => (
                        <Card key={req._id}>
                            <CardContent className="p-6 pt-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {req.title}
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${req.priority === 'High' || req.priority === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200' :
                                            req.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {req.priority}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500">{req.description}</p>
                                    <p className="text-xs text-gray-400">Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {req.status === 'Open' && <Clock className="h-5 w-5 text-yellow-500" />}
                                    {req.status === 'In Progress' && <Wrench className="h-5 w-5 text-blue-500" />}
                                    {req.status === 'Resolved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    {req.status === 'Closed' && <XCircle className="h-5 w-5 text-gray-500" />}
                                    <span className="text-sm font-medium">{req.status}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
