import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle, XCircle, FileText, Trash2, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { GET_APPLICATIONS } from "@/graphql/queries"
import { UPDATE_APPLICATION_STATUS, DELETE_APPLICATION, ACCEPT_APPLICATION } from "@/graphql/mutations"
import { formatDate } from "@/lib/utils"

export default function ManagerApplications() {
    const { data, loading, error, refetch } = useQuery<any>(GET_APPLICATIONS)
    const [updateStatus, { loading: updating }] = useMutation(UPDATE_APPLICATION_STATUS, {
        onCompleted: () => refetch()
    })
    const [deleteApplication, { loading: deleting }] = useMutation(DELETE_APPLICATION, {
        onCompleted: () => refetch()
    })
    const [acceptApplication, { loading: accepting }] = useMutation(ACCEPT_APPLICATION, {
        onCompleted: () => {
            setIsAcceptOpen(false)
            setSelectedApp(null)
            refetch()
            alert("Application accepted and lease created successfully!")
        },
        onError: (err) => {
            alert(`Failed to accept application: ${err.message}`)
        }
    })

    const [isAcceptOpen, setIsAcceptOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState<any>(null)

    // Lease Form State
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [monthlyRent, setMonthlyRent] = useState("")
    const [securityDeposit, setSecurityDeposit] = useState("")

    const handleApproveClick = (app: any) => {
        setSelectedApp(app)
        // Pre-fill dates from application if available
        if (app.move_in_date) setStartDate(new Date(app.move_in_date).toISOString().split('T')[0])
        if (app.move_out_date) setEndDate(new Date(app.move_out_date).toISOString().split('T')[0])

        // Pre-fill rent and deposit from unit
        const rent = app.unit?.rent?.toString() || ""
        setMonthlyRent(rent)
        setSecurityDeposit(rent) // Default deposit to 1 month rent
        setIsAcceptOpen(true)
    }

    const handleConfirmAccept = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedApp) return

        try {
            await acceptApplication({
                variables: {
                    application_id: selectedApp._id,
                    start_date: new Date(startDate).toISOString(),
                    end_date: new Date(endDate).toISOString(),
                    monthly_rent: parseFloat(monthlyRent),
                    security_deposit: parseFloat(securityDeposit)
                }
            })
        } catch (err) {
            console.error("Failed to accept application:", err)
        }
    }

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this application?")) return
        try {
            await updateStatus({
                variables: { id, status: 'Rejected' }
            })
        } catch (err) {
            console.error("Failed to update status:", err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this application?")) return
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

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const applications = [...(data?.applicationMany || [])].sort((a: any, b: any) => {
        const dateA = new Date(a.date_applied).getTime()
        const dateB = new Date(b.date_applied).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

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
                                    <th
                                        className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date Applied
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">Requested Dates</th>
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
                                                {formatDate(app.date_applied)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {app.move_in_date ? (
                                                    <div>
                                                        {formatDate(app.move_in_date)} -
                                                        <br />
                                                        {app.move_out_date ? formatDate(app.move_out_date) : 'N/A'}
                                                    </div>
                                                ) : "Not specified"}
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
                                                <div className="flex justify-end gap-2">
                                                    {app.status === 'Pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleApproveClick(app)}
                                                                disabled={updating || accepting}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleReject(app._id)}
                                                                disabled={updating || accepting}
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-4 w-4 flex-shrink-0" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(app._id)}
                                                        disabled={deleting}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Approve Application & Create Lease</DialogTitle>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
                            <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Applicant Details</h4>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs">Full Name</span>
                                    <span className="font-medium text-gray-900">{selectedApp.applicant_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Email Address</span>
                                    <span className="font-medium text-gray-900">{selectedApp.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Phone Number</span>
                                    <span className="font-medium text-gray-900">{selectedApp.phone}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Date Applied</span>
                                    <span className="font-medium text-gray-900">{formatDate(selectedApp.date_applied)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleConfirmAccept} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rent">Monthly Rent ($)</Label>
                                <Input
                                    id="rent"
                                    type="number"
                                    value={monthlyRent}
                                    readOnly
                                    className="bg-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Security Deposit ($)</Label>
                                <Input
                                    id="deposit"
                                    type="number"
                                    value={securityDeposit}
                                    readOnly
                                    className="bg-gray-100"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAcceptOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={accepting}>
                                {accepting ? "Creating Lease..." : "Create Lease"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
