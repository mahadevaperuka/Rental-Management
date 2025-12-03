import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Trash2, Home, Bed, Bath, DollarSign, Pencil } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { GET_MANAGER_UNITS_PAGE_DATA } from "@/graphql/queries"
import { CREATE_UNIT, DELETE_UNIT, UPDATE_UNIT } from "@/graphql/mutations"

export default function ManagerUnits() {
    const { data: session } = authClient.useSession()

    // Use linked_id to find the manager profile
    const managerId = (session?.user as any)?.linked_id

    const { data, loading, error, refetch } = useQuery<any>(GET_MANAGER_UNITS_PAGE_DATA, {
        variables: { id: managerId },
        skip: !managerId
    })

    const [createUnit, { loading: creating }] = useMutation(CREATE_UNIT, {
        onCompleted: () => {
            setIsOpen(false)
            resetForm()
            refetch()
        }
    })

    const [deleteUnit, { loading: deleting }] = useMutation(DELETE_UNIT, {
        onCompleted: () => refetch()
    })

    const [updateUnit, { loading: updating }] = useMutation(UPDATE_UNIT, {
        onCompleted: () => {
            setIsEditOpen(false)
            setEditingUnit(null)
            refetch()
        }
    })

    const [isOpen, setIsOpen] = useState(false)
    const [newUnit, setNewUnit] = useState({
        apartment_no: "",
        floor: "",
        bedrooms: "",
        bathrooms: "",
        rent: "",
        status: "Available",
        imageUrl: ""
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState<any>(null)
    const [editForm, setEditForm] = useState({
        apartment_no: "",
        floor: "",
        bedrooms: "",
        bathrooms: "",
        rent: "",
        status: "Available",
        imageUrl: ""
    })

    const handleEditClick = (unit: any) => {
        setEditingUnit(unit)
        setEditForm({
            apartment_no: unit.apartment_no,
            floor: unit.floor.toString(),
            bedrooms: unit.bedrooms.toString(),
            bathrooms: unit.bathrooms.toString(),
            rent: unit.rent.toString(),
            status: unit.status,
            imageUrl: unit.images?.[0] || ""
        })
        setIsEditOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUnit) return

        try {
            await updateUnit({
                variables: {
                    _id: editingUnit._id,
                    record: {
                        apartment_no: editForm.apartment_no,
                        floor: parseInt(editForm.floor),
                        bedrooms: parseInt(editForm.bedrooms),
                        bathrooms: parseInt(editForm.bathrooms),
                        rent: parseFloat(editForm.rent),
                        status: editForm.status,
                        images: editForm.imageUrl ? [editForm.imageUrl] : []
                    }
                }
            })
        } catch (err) {
            console.error("Failed to update unit:", err)
        }
    }

    const resetForm = () => {
        setNewUnit({
            apartment_no: "",
            floor: "",
            bedrooms: "",
            bathrooms: "",
            rent: "",
            status: "Available",
            imageUrl: ""
        })
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const communityId = data?.managerById?.community?._id
        if (!communityId) return

        try {
            await createUnit({
                variables: {
                    record: {
                        community_id: communityId,
                        apartment_no: newUnit.apartment_no,
                        floor: parseInt(newUnit.floor),
                        bedrooms: parseInt(newUnit.bedrooms),
                        bathrooms: parseInt(newUnit.bathrooms),
                        rent: parseFloat(newUnit.rent),
                        status: newUnit.status,
                        images: newUnit.imageUrl ? [newUnit.imageUrl] : []
                    }
                }
            })
        } catch (err) {
            console.error("Failed to create unit:", err)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this unit?")) {
            try {
                await deleteUnit({ variables: { id } })
            } catch (err) {
                console.error("Failed to delete unit:", err)
            }
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div className="text-red-500">Error: {error.message}</div>

    const community = data?.managerById?.community
    const units = community?.units || []

    if (!community) return <div className="p-8">No community assigned to this manager.</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Units - {community.name}</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Unit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Unit</DialogTitle>
                            <DialogDescription>Add a new apartment to your community.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4 grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="apt_no">Apartment No</Label>
                                    <Input
                                        id="apt_no"
                                        value={newUnit.apartment_no}
                                        onChange={(e) => setNewUnit({ ...newUnit, apartment_no: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="floor">Floor</Label>
                                    <Input
                                        id="floor"
                                        type="number"
                                        value={newUnit.floor}
                                        onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="beds">Bedrooms</Label>
                                    <Input
                                        id="beds"
                                        type="number"
                                        value={newUnit.bedrooms}
                                        onChange={(e) => setNewUnit({ ...newUnit, bedrooms: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="baths">Bathrooms</Label>
                                    <Input
                                        id="baths"
                                        type="number"
                                        value={newUnit.bathrooms}
                                        onChange={(e) => setNewUnit({ ...newUnit, bathrooms: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="rent">Rent ($)</Label>
                                    <Input
                                        id="rent"
                                        type="number"
                                        value={newUnit.rent}
                                        onChange={(e) => setNewUnit({ ...newUnit, rent: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={newUnit.status}
                                        onValueChange={(val) => setNewUnit({ ...newUnit, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Available">Available</SelectItem>
                                            <SelectItem value="Occupied">Occupied</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 col-span-2">
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input
                                        id="image"
                                        value={newUnit.imageUrl}
                                        onChange={(e) => setNewUnit({ ...newUnit, imageUrl: e.target.value })}
                                        placeholder="https://example.com/apartment.jpg"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating}>
                                    {creating ? "Creating..." : "Create Unit"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {units.map((unit: any) => (
                    <Card key={unit._id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold">
                                Unit {unit.apartment_no}
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditClick(unit)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(unit._id)}
                                    disabled={deleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2"><Home className="h-4 w-4" /> Floor {unit.floor}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${unit.status === 'Available' ? 'bg-green-100 text-green-700' :
                                        unit.status === 'Occupied' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>{unit.status}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {unit.bedrooms}</span>
                                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {unit.bathrooms}</span>
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-black">
                                    <DollarSign className="h-4 w-4" /> {unit.rent}/mo
                                </div>
                                {unit.images?.[0] && (
                                    <div className="mt-2 aspect-video rounded-md overflow-hidden bg-gray-100">
                                        <img src={unit.images[0]} alt={`Unit ${unit.apartment_no}`} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Unit</DialogTitle>
                        <DialogDescription>Update unit details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4 grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_apt_no">Apartment No</Label>
                                <Input
                                    id="edit_apt_no"
                                    value={editForm.apartment_no}
                                    onChange={(e) => setEditForm({ ...editForm, apartment_no: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_floor">Floor</Label>
                                <Input
                                    id="edit_floor"
                                    type="number"
                                    value={editForm.floor}
                                    onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_beds">Bedrooms</Label>
                                <Input
                                    id="edit_beds"
                                    type="number"
                                    value={editForm.bedrooms}
                                    onChange={(e) => setEditForm({ ...editForm, bedrooms: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_baths">Bathrooms</Label>
                                <Input
                                    id="edit_baths"
                                    type="number"
                                    value={editForm.bathrooms}
                                    onChange={(e) => setEditForm({ ...editForm, bathrooms: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_rent">Rent ($)</Label>
                                <Input
                                    id="edit_rent"
                                    type="number"
                                    value={editForm.rent}
                                    onChange={(e) => setEditForm({ ...editForm, rent: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_status">Status</Label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Available">Available</SelectItem>
                                        <SelectItem value="Occupied">Occupied</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2 col-span-2">
                                <Label htmlFor="edit_image">Image URL</Label>
                                <Input
                                    id="edit_image"
                                    value={editForm.imageUrl}
                                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/apartment.jpg"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={updating}>
                                {updating ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
