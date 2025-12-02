import { gql } from "@apollo/client"
import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, FileText } from "lucide-react"

const GET_APPLICATIONS = gql`
  query GetApplications {
    applicationMany {
      _id
      applicant_name
      email
      phone
      date_applied
      status
      documents
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
`

const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($id: MongoID!, $status: EnumApplicationStatus!) {
    applicationUpdateById(_id: $id, record: { status: $status }) {
      record {
        _id
        status
      }
    }
  }
`

export default function ManagerApplications() {
    const { data, loading, error, refetch } = useQuery<any>(GET_APPLICATIONS)
    const [updateStatus, { loading: updating }] = useMutation(UPDATE_APPLICATION_STATUS, {
        onCompleted: () => refetch()
    })

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateStatus({
                variables: { id, status }
            })
        } catch (err) {
            console.error("Failed to update status:", err)
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading applications...</div>
    if (error) return <div className="text-red-500 p-8">Error loading applications: {error.message}</div>

    const applications = data?.applicationMany || []

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Application Review</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Pending Applications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-100">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Applicant</th>
                                    <th className="px-4 py-3">Unit</th>
                                    <th className="px-4 py-3">Date Applied</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No applications found.</td>
                                    </tr>
                                ) : (
                                    applications.map((app: any) => (
                                        <tr key={app._id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{app.applicant_name}</div>
                                                <div className="text-xs text-gray-500">{app.email}</div>
                                                <div className="text-xs text-gray-500">{app.phone}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">Unit {app.unit?.apartment_no}</div>
                                                <div className="text-xs text-gray-500">{app.unit?.community?.name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(app.date_applied).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${app.status === 'Approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                    app.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                        'bg-red-50 text-red-700 ring-red-600/20'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {app.status === 'Pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleStatusUpdate(app._id, 'Approved')}
                                                            disabled={updating}
                                                        >
                                                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                                            disabled={updating}
                                                        >
                                                            <XCircle className="h-4 w-4 flex-shrink-0" />
                                                        </Button>
                                                    </div>
                                                )}
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
