import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Plus, Trash2, MapPin, User, Pencil } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GET_COMMUNITIES_AND_MANAGERS } from "@/graphql/queries"
import { CREATE_COMMUNITY, DELETE_COMMUNITY, UPDATE_COMMUNITY } from "@/graphql/mutations"

export default function AdminCommunities() {
    const { data, loading, error, refetch } = useQuery<any>(GET_COMMUNITIES_AND_MANAGERS)
    const [createCommunity, { loading: creating }] = useMutation(CREATE_COMMUNITY, {
        onCompleted: () => {
            setIsOpen(false)
            resetForm()
            refetch()
        }
    })
    const [updateCommunity, { loading: updating }] = useMutation(UPDATE_COMMUNITY, {
        onCompleted: () => {
            setIsOpen(false)
            resetForm()
            refetch()
        }
    })
    const [deleteCommunity, { loading: deleting }] = useMutation(DELETE_COMMUNITY, {
        onCompleted: () => refetch()
    })

    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [location, setLocation] = useState("")
    const [description, setDescription] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [selectedManagerId, setSelectedManagerId] = useState("")

    const resetForm = () => {
        setName("")
        setLocation("")
        setDescription("")
        setImageUrl("")
        setSelectedManagerId("")
        setIsEditing(false)
        setEditingId(null)
    }

    const handleOpenCreate = () => {
        resetForm()
        setIsOpen(true)
    }

    const handleOpenEdit = (community: any) => {
        setName(community.name)
        setLocation(community.location)
        setDescription(community.description || "")
        setImageUrl(community.images?.[0] || "")
        // Find manager ID based on email since manager_id might not match if manager doc was recreated
        // But wait, community.manager stores manager_id.
        // Let's try to match by manager_id first.
        const manager = data?.managerMany.find((m: any) => m._id === community.manager.manager_id)
        if (manager) {
            setSelectedManagerId(manager._id)
        } else {
            // Fallback or handle unassigned/deleted manager
            setSelectedManagerId("")
        }

        setIsEditing(true)
        setEditingId(community._id)
        setIsOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const selectedManager = data?.managerMany.find((m: any) => m._id === selectedManagerId)
        if (!selectedManager) return

        const managerInput = {
            manager_id: selectedManager._id,
            name: selectedManager.name,
            email: selectedManager.email,
            phone: selectedManager.phone
        }

        try {
            if (isEditing && editingId) {
                await updateCommunity({
                    variables: {
                        _id: editingId,
                        name,
                        location,
                        description,
                        images: imageUrl ? [imageUrl] : [],
                        manager: managerInput
                    }
                })
            } else {
                await createCommunity({
                    variables: {
                        record: {
                            name,
                            location,
                            description,
                            manager: managerInput,
                            images: imageUrl ? [imageUrl] : []
                        }
                    }
                })
            }
        } catch (err) {
            console.error("Failed to save community:", err)
        }
    }

    const [errorDialog, setErrorDialog] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
            try {
                await deleteCommunity({
                    variables: { id }
                })
            } catch (err: any) {
                console.error("Failed to delete community:", err)
                setErrorDialog(err.message || "Failed to delete community.")
            }
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading data...</div>
    if (error) return <div className="text-red-500 p-8">Error loading data: {error.message}</div>

    const communities = data?.communityMany || []
    const managers = data?.managerMany || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" />
                            Add Community
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Community" : "Add New Community"}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? "Update community details and manager." : "Create a new community and assign a manager."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Community Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Downtown Lofts"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. 123 Main St, City"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of the community"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input
                                        id="image"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="manager">Manager</Label>
                                    <Select value={selectedManagerId} onValueChange={setSelectedManagerId} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map((manager: any) => {
                                                const isAssigned = manager.community && manager.community._id;
                                                const isCurrentManager = selectedManagerId === manager._id;

                                                if (isAssigned && !isCurrentManager) return null;

                                                return (
                                                    <SelectItem key={manager._id} value={manager._id}>
                                                        {manager.name} ({manager.email})
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating || updating}>
                                    {creating || updating ? "Saving..." : (isEditing ? "Update Community" : "Create Community")}
                                </Button>
                            </DialogFooter>
                        </form>
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {communities.length === 0 ? (
                    <div className="col-span-full text-center py-12 border border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500">No communities found. Create one to get started.</p>
                    </div>
                ) : (
                    communities.map((community: any) => (
                        <Card key={community._id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-gray-500" />
                                    {community.name}
                                </CardTitle>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                        onClick={() => handleOpenEdit(community)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(community._id)}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-500 mt-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {community.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {community.manager?.name || "Unassigned"}
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
