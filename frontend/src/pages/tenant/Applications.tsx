import { useQuery, useMutation } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { GET_MY_APPLICATIONS } from "@/graphql/queries"
import { DELETE_APPLICATION } from "@/graphql/mutations"

export default function TenantApplications() {
    const { data: session } = authClient.useSession()
    const { data, loading, error, refetch } = useQuery<any>(GET_MY_APPLICATIONS, {
        variables: {
            email: session?.user?.email
        },
        skip: !session?.user?.email
    })

    const [deleteApplication, { loading: deleting }] = useMutation(DELETE_APPLICATION, {
        onCompleted: () => refetch()
    })

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to withdraw this application?")) return
        try {
            await deleteApplication({
                variables: { id }
            })
        } catch (err) {
            console.error("Failed to delete application:", err)
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading applications...</div>
    if (error) return <div className="text-red-500 p-8">Error loading applications: {error.message}</div>

    const applications = data?.applicationMany || []

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>

            {applications.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">No Applications Found</h2>
                    <p className="text-gray-500">You haven't submitted any rental applications yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {applications.map((app: any) => (
                        <Card key={app._id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Unit {app.unit?.apartment_no}</span>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${app.status === 'Approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                        app.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                            'bg-red-50 text-red-700 ring-red-600/20'
                                        }`}>
                                        {app.status}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Community</p>
                                    <p className="font-semibold">{app.unit?.community?.name}</p>
                                    <p className="text-sm text-gray-500">{app.unit?.community?.location}</p>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Rent</p>
                                        <p>${app.unit?.rent}/mo</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Applied On</p>
                                        <p>{new Date(app.date_applied).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        {app.status === 'Pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                                        {app.status === 'Approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        {app.status === 'Rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                                        <span>
                                            {app.status === 'Pending' ? 'Awaiting Review' :
                                                app.status === 'Approved' ? 'Approved' :
                                                    'Declined'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(app._id)}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Withdraw
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
