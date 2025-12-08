import { useState, useMemo } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { User, ShieldCheck, ShieldAlert, Search, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { GET_USERS } from "@/graphql/queries"
import { CREATE_USER, DELETE_USER, UPDATE_USER, UPDATE_LEASE } from "@/graphql/mutations"


export default function AdminUsers() {
    const { data, loading, error, refetch } = useQuery<any>(GET_USERS)
    const [updateRole, { loading: updating }] = useMutation(UPDATE_USER)

    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("admins")

    const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
        onCompleted: () => {
            setIsAddOpen(false)
            setNewUser({ name: "", email: "", phone: "", password: "", role: "Manager" })
            refetch()
        }
    })

    const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
        onCompleted: () => {
            refetch()
        }
    })

    const [errorDialog, setErrorDialog] = useState<string | null>(null)

    const handleDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteUser({
                    variables: { _id: userId }
                })
            } catch (err: any) {
                console.error("Failed to delete user:", err)
                setErrorDialog(err.message || "Failed to delete user. Please try again.")
            }
        }
    }

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Manager", // Default to Manager, and only Manager allowed
    })

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createUser({
                variables: {
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    password: newUser.password,
                    role: "Manager", // Enforce Manager
                }
            })
        } catch (err) {
            console.error("Failed to create user:", err)
        }
    }

    const [editingUser, setEditingUser] = useState<any>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleEditClick = (user: any) => {
        setEditingUser({ ...user })
        setIsEditOpen(true)
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return

        try {
            await updateRole({
                variables: {
                    _id: editingUser._id,
                    name: editingUser.name,
                    email: editingUser.email,
                    role: editingUser.role,
                }
            })
            setIsEditOpen(false)
            setEditingUser(null)
            refetch()
        } catch (err) {
            console.error("Failed to update user:", err)
        }
    }

    // Lease Editing Logic
    const [updateLease, { loading: updatingLease }] = useMutation(UPDATE_LEASE, {
        onCompleted: () => {
            setIsLeaseEditOpen(false)
            setEditingLease(null)
            refetch()
        }
    })

    const [editingLease, setEditingLease] = useState<any>(null)
    const [isLeaseEditOpen, setIsLeaseEditOpen] = useState(false)

    const handleLeaseEditClick = (user: any) => {
        const lease = user.tenant_profile?.lease;
        if (!lease) {
            alert("This user does not have an active lease to edit.")
            return
        }
        setEditingLease({
            _id: lease._id,
            start_date: lease.start_date.split('T')[0],
            end_date: lease.end_date.split('T')[0],
            monthly_rent: lease.monthly_rent,
            security_deposit: lease.security_deposit,
            status: lease.status
        })
        setIsLeaseEditOpen(true)
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

    const filteredUsers = useMemo(() => {
        if (!data?.userMany) return []

        return data.userMany.filter((user: any) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesTab =
                activeTab === "guests" ? user.role === "Guest" :
                    activeTab === "tenants" ? user.role === "Tenant" :
                        activeTab === "managers" ? user.role === "Manager" :
                            activeTab === "admins" ? user.role === "Admin" :
                                true

            return matchesSearch && matchesTab
        })
    }, [data?.userMany, searchQuery, activeTab])

    if (loading) return <div className="flex justify-center p-8">Loading users...</div>
    if (error) return <div className="text-red-500 p-8">Error loading users: {error.message}</div>

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Admin': return <ShieldAlert className="h-4 w-4 text-red-500" />
            case 'Manager': return <ShieldCheck className="h-4 w-4 text-blue-500" />
            case 'Guest': return <User className="h-4 w-4 text-gray-400" />
            default: return <User className="h-4 w-4 text-green-500" />
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return "bg-red-100 text-red-800 hover:bg-red-100"
            case 'Manager': return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case 'Guest': return "bg-gray-100 text-gray-800 hover:bg-gray-100"
            default: return "bg-green-100 text-green-800 hover:bg-green-100"
        }
    }

    const UserTable = ({ users }: { users: any[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No users found matching your criteria.
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user: any) => (
                        <TableRow key={user._id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {getRoleIcon(user.role)}
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {user.role !== 'Admin' && (
                                    <div className="flex items-center gap-2">
                                        {user.role === 'Tenant' && user.tenant_profile?.lease && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleLeaseEditClick(user)}
                                            >
                                                Edit Lease
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditClick(user)}
                                        >
                                            Edit User
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(user._id)}
                                            disabled={deleting}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                Add Manager
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                            <DialogHeader>
                                <DialogTitle>Add New Manager</DialogTitle>
                                <DialogDescription>
                                    Create a new manager account.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            placeholder="123-456-7890"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value="temporary"
                                            disabled
                                            placeholder="Temporary password will be set"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Managers are assigned a temporary password ('temporary') and must change it on first login.
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={creating}>
                                        {creating ? "Creating..." : "Create Manager"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="bg-white">
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            {editingUser && (
                                <form onSubmit={handleUpdateUser}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-name">Name</Label>
                                            <Input
                                                id="edit-name"
                                                value={editingUser.name}
                                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-email">Email</Label>
                                            <Input
                                                id="edit-email"
                                                type="email"
                                                value={editingUser.email}
                                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                                required
                                            />
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
                </div>
            </div>

            <Tabs defaultValue="admins" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                    <TabsTrigger value="tenants">Tenants</TabsTrigger>
                    <TabsTrigger value="managers">Managers</TabsTrigger>
                    <TabsTrigger value="guests">Guests</TabsTrigger>
                </TabsList>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="admins" className="m-0">
                            <UserTable users={filteredUsers} />
                        </TabsContent>
                        <TabsContent value="tenants" className="m-0">
                            <UserTable users={filteredUsers} />
                        </TabsContent>
                        <TabsContent value="managers" className="m-0">
                            <UserTable users={filteredUsers} />
                        </TabsContent>
                        <TabsContent value="guests" className="m-0">
                            <UserTable users={filteredUsers} />
                        </TabsContent>

                    </CardContent>
                </Card>
            </Tabs>

            <Dialog open={isLeaseEditOpen} onOpenChange={setIsLeaseEditOpen}>
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
                                <Button type="submit" disabled={updatingLease}>
                                    {updatingLease ? "Saving..." : "Save Changes"}
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
