import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Phone, Mail, Home } from "lucide-react"
import { GET_TENANTS } from "@/graphql/queries"
import { DELETE_TENANT, UPDATE_LEASE } from "@/graphql/mutations"

export default function ManagerTenants() {
    const { data, loading, error, refetch } = useQuery<any>(GET_TENANTS)

    const [deleteTenant, { loading: deleting }] = useMutation(DELETE_TENANT, {
        onCompleted: () => {
            refetch()
        }
    })

    const [updateLease, { loading: updating }] = useMutation(UPDATE_LEASE, {
        onCompleted: () => {
            setIsEditOpen(false)
            setEditingLease(null)
            refetch()
        }
    })

    const [errorDialog, setErrorDialog] = useState<string | null>(null)

    const handleDelete = async (tenantId: string) => {
        if (confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
            try {
                await deleteTenant({
                    variables: { _id: tenantId }
                })
            } catch (err: any) {
                console.error("Failed to delete tenant:", err)
                setErrorDialog(err.message || "Failed to delete tenant. Please try again.")
            }
        }
    }

    const [editingLease, setEditingLease] = useState<any>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleEditClick = (tenant: any) => {
        if (!tenant.lease) {
            alert("This tenant does not have an active lease to edit.")
            return
        }
        setEditingLease({
            _id: tenant.lease._id,
            start_date: tenant.lease.start_date.split('T')[0],
            end_date: tenant.lease.end_date.split('T')[0],
            monthly_rent: tenant.lease.monthly_rent,
            security_deposit: tenant.lease.security_deposit,
            status: tenant.lease.status
        })
        setIsEditOpen(true)
    }

    const handleUpdateLease = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingLease) return

        try {
            await updateLease({
                variables: {
                    _id: editingLease._id,
                    start_date: new Date(editingLease.start_date).toISOString(),
                    end_date: new Date(editingLease.end_date).toISOString(),
                    monthly_rent: parseFloat(editingLease.monthly_rent),
                    security_deposit: parseFloat(editingLease.security_deposit),
                    status: editingLease.status
                }
            })
        } catch (err) {
            console.error("Failed to update lease:", err)
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading tenants...</div>
    if (error) return <div className="text-red-500 p-8">Error loading tenants: {error.message}</div>

    const tenants = data?.tenantMany || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Tenant Directory</h1>
            </div>

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
                                    <th className="px-4 py-3">Lease Period</th>
                                    <th className="px-4 py-3">Lease Status</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No tenants found.</td>
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
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-3 w-3 text-gray-400" />
                                                        <span>Unit {tenant.lease.unit.apartment_no}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">No unit assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {tenant.lease ? (
                                                    <div className="text-xs text-gray-500">
                                                        <div>Start: {new Date(tenant.lease.start_date).toLocaleDateString()}</div>
                                                        <div>End: {new Date(tenant.lease.end_date).toLocaleDateString()}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {tenant.lease ? (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tenant.lease.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                        tenant.lease.status === 'Terminated' ? 'bg-red-50 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {tenant.lease.status}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditClick(tenant)}
                                                        disabled={!tenant.lease}
                                                    >
                                                        Edit Lease
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(tenant.user?._id)}
                                                        disabled={deleting}
                                                    >
                                                        Delete
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Lease Details</DialogTitle>
                    </DialogHeader>
                    {editingLease && (
                        <form onSubmit={handleUpdateLease}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date">Start Date</Label>
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={editingLease.start_date}
                                            onChange={(e) => setEditingLease({ ...editingLease, start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-date">End Date</Label>
                                        <Input
                                            id="end-date"
                                            type="date"
                                            value={editingLease.end_date}
                                            onChange={(e) => setEditingLease({ ...editingLease, end_date: e.target.value })}
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
                                            value={editingLease.monthly_rent}
                                            onChange={(e) => setEditingLease({ ...editingLease, monthly_rent: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deposit">Security Deposit ($)</Label>
                                        <Input
                                            id="deposit"
                                            type="number"
                                            value={editingLease.security_deposit}
                                            onChange={(e) => setEditingLease({ ...editingLease, security_deposit: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={editingLease.status}
                                        onValueChange={(value) => setEditingLease({ ...editingLease, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Terminated">Terminated</SelectItem>
                                            <SelectItem value="Expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={updating}>
                                    {updating ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!errorDialog} onOpenChange={(open) => !open && setErrorDialog(null)}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Action Failed</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">{errorDialog}</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setErrorDialog(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
