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
import { authClient } from "@/lib/auth-client"
import { GET_TENANTS, GET_MANAGER_BY_EMAIL } from "@/graphql/queries"
import { DELETE_TENANT, UPDATE_LEASE } from "@/graphql/mutations"

export default function ManagerTenants() {
    const { data: session } = authClient.useSession()

    // Main Tenants Query
    const { data, loading, error, refetch } = useQuery<any>(GET_TENANTS)

    // Manager Context Query (to get Community ID)
    const { data: managerData, loading: managerLoading } = useQuery<any>(GET_MANAGER_BY_EMAIL, {
        variables: { email: session?.user?.email },
        skip: !session?.user?.email
    })

    const currentCommunityId = managerData?.managerOne?.community?._id

    // Mutations
    const [deleteTenant, { loading: deleting }] = useMutation(DELETE_TENANT, {
        onCompleted: () => refetch()
    })

    const [updateLease, { loading: updating }] = useMutation(UPDATE_LEASE, {
        onCompleted: () => {
            setIsEditOpen(false)
            setEditingLease(null)
            refetch()
        }
    })

    const [errorDialog, setErrorDialog] = useState<string | null>(null)
    const [editingLease, setEditingLease] = useState<any>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [availableLeases, setAvailableLeases] = useState<any[]>([])

    // Handlers
    const handleDelete = async (tenantId: string) => {
        if (confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
            try {
                await deleteTenant({ variables: { _id: tenantId } })
            } catch (err: any) {
                console.error("Failed to delete tenant:", err)
                setErrorDialog(err.message || "Failed to delete tenant. Please try again.")
            }
        }
    }

    const handleEditClick = (tenant: any) => {
        // Filter to only show Active leases within the current community for editing
        const leases = (tenant.leases || []).filter((l: any) =>
            l.status === 'Active' &&
            String(l.unit?.community?._id) === String(currentCommunityId)
        );

        if (leases.length === 0) {
            alert("This tenant does not have an active lease in your community to edit.")
            return
        }

        setAvailableLeases(leases)
        const leaseToEdit = leases[0] // Default to first

        setEditingLease({
            _id: leaseToEdit._id,
            start_date: leaseToEdit.start_date.split('T')[0],
            end_date: leaseToEdit.end_date.split('T')[0],
            monthly_rent: leaseToEdit.monthly_rent,
            security_deposit: leaseToEdit.security_deposit,
            status: leaseToEdit.status
        })
        setIsEditOpen(true)
    }

    const handleLeaseSelectionChange = (leaseId: string) => {
        const lease = availableLeases.find(l => l._id === leaseId)
        if (lease) {
            setEditingLease({
                _id: lease._id,
                start_date: lease.start_date.split('T')[0],
                end_date: lease.end_date.split('T')[0],
                monthly_rent: lease.monthly_rent,
                security_deposit: lease.security_deposit,
                status: lease.status
            })
        }
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

    if (loading || managerLoading) return <div className="flex justify-center p-8">Loading tenants...</div>
    if (error) return <div className="text-red-500 p-8">Error loading tenants: {error.message}</div>

    // Helper to safely compare ObjectIDs
    const isSameCommunity = (id1: any, id2: any) => String(id1) === String(id2);

    const tenants = (data?.tenantMany || []).filter((tenant: any) =>
        // Filter tenants to ONLY show those with active leases IN THIS COMMUNITY
        tenant.leases?.some((lease: any) =>
            lease.status === 'Active' &&
            isSameCommunity(lease.unit?.community?._id, currentCommunityId)
        )
    );

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
                                    <th className="px-4 py-3">Next Payment</th>
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
                                    tenants.map((tenant: any) => {
                                        // Filter active leases to ONLY show those IN THIS COMMUNITY
                                        const activeLeases = tenant.leases?.filter((l: any) =>
                                            l.status === 'Active' &&
                                            isSameCommunity(l.unit?.community?._id, currentCommunityId)
                                        ) || [];
                                        return (
                                            <tr key={tenant._id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium align-top">{tenant.name}</td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Mail className="h-3 w-3" /> {tenant.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                                                        <Phone className="h-3 w-3" /> {tenant.phone}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {activeLeases.length > 0 ? (
                                                        <div className="flex flex-col gap-3">
                                                            {activeLeases.map((l: any) => (
                                                                <div key={l._id} className="flex items-center gap-2 h-6">
                                                                    <Home className="h-3 w-3 text-gray-400" />
                                                                    <span className="whitespace-nowrap">Unit {l.unit?.apartment_no}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No unit assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {activeLeases.length > 0 ? (
                                                        <div className="flex flex-col gap-3">
                                                            {activeLeases.map((l: any) => (
                                                                <div key={l._id} className="text-xs text-gray-500 h-6 flex items-center whitespace-nowrap">
                                                                    {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {activeLeases.length > 0 ? (
                                                        <div className="flex flex-col gap-3">
                                                            {activeLeases.map((l: any) => (
                                                                <div key={l._id} className="text-sm h-6 flex items-center whitespace-nowrap">
                                                                    {l.next_payment_date ? new Date(l.next_payment_date).toLocaleDateString() : '-'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {activeLeases.length > 0 ? (
                                                        <div className="flex flex-col gap-3">
                                                            {activeLeases.map((l: any) => (
                                                                <div key={l._id} className="h-6 flex items-center">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${l.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                                        l.status === 'Terminated' ? 'bg-red-50 text-red-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {l.status}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditClick(tenant)}
                                                            disabled={!tenant.leases || tenant.leases.length === 0}
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
                                        );
                                    })
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
                                {availableLeases.length > 1 && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="lease-select">Select Lease to Edit</Label>
                                        <Select
                                            value={editingLease._id}
                                            onValueChange={handleLeaseSelectionChange}
                                        >
                                            <SelectTrigger id="lease-select" className="bg-gray-50">
                                                <SelectValue placeholder="Select a lease" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {availableLeases.map((lease: any) => (
                                                    <SelectItem key={lease._id} value={lease._id}>
                                                        Unit {lease.unit?.apartment_no} ({lease.status}) - ${lease.monthly_rent}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

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
