import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, MapPin, Save } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { GET_MY_COMMUNITY } from "@/graphql/queries"
import { UPDATE_COMMUNITY } from "@/graphql/mutations"

export default function ManagerCommunity() {
    const { data: session } = authClient.useSession()

    const { data, loading, error, refetch } = useQuery<any>(GET_MY_COMMUNITY, {
        variables: { id: (session?.user as any)?.linked_id },
        skip: !(session?.user as any)?.linked_id
    })

    const [updateCommunity, { loading: updating }] = useMutation(UPDATE_COMMUNITY, {
        onCompleted: () => {
            refetch()
        }
    })

    const [name, setName] = useState("")
    const [location, setLocation] = useState("")
    const [description, setDescription] = useState("")
    const [imageUrl, setImageUrl] = useState("")

    useEffect(() => {
        if (data?.managerById?.community) {
            const community = data.managerById.community
            setName(community.name || "")
            setLocation(community.location || "")
            setDescription(community.description || "")
            setImageUrl(community.images?.[0] || "")
        }
    }, [data])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!data?.managerById?.community?._id) return

        try {
            // We need to pass the manager object back, even if we're not changing it
            // because the mutation expects it if we want to keep it?
            // Actually, if we don't pass it, it might be unset if the backend replaces the whole object?
            // The backend resolver `updateById` typically does a partial update if using mongoose,
            // but our mutation defined `manager: CommunityManagerInput`.
            // If we omit it, it might be fine if the resolver handles partial updates.
            // However, looking at the mutation: `record: { ... manager: $manager }`.
            // If $manager is null/undefined, it might unset it or ignore it depending on graphql-compose.
            // To be safe, let's construct the manager object from the current user data or fetched data.
            // But wait, the `GET_MY_COMMUNITY` query doesn't fetch the manager details inside the community object
            // because we know who the manager is (us).
            // Let's check `GET_MY_COMMUNITY` again. It fetches `_id, name, location, description, images`.
            // It does NOT fetch `manager`.

            // If I omit `manager` in the mutation variable, what happens?
            // The mutation definition is:
            // mutation UpdateCommunity(..., $manager: CommunityManagerInput) {
            //   communityUpdateById(..., record: { ..., manager: $manager })
            // }
            // If $manager is undefined, `manager` field in record will be undefined.
            // `graphql-compose-mongoose` usually treats undefined fields as "do not update".
            // So it should be safe to omit it.

            await updateCommunity({
                variables: {
                    _id: data.managerById.community._id,
                    name,
                    location,
                    description,
                    images: imageUrl ? [imageUrl] : []
                    // Omit manager to preserve existing
                }
            })
        } catch (err) {
            console.error("Failed to update community:", err)
        }
    }

    if (loading) return <div className="flex justify-center p-8">Loading data...</div>
    if (error) return <div className="text-red-500 p-8">Error loading data: {error.message}</div>
    if (!data?.managerById?.community) return <div className="p-8">No community assigned.</div>

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Community</h1>
                <p className="text-gray-500">Manage your community details.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Community Details</CardTitle>
                    <CardDescription>
                        Update information visible to tenants and applicants.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Community Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9"
                                    placeholder="e.g. Downtown Lofts"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-9"
                                    placeholder="e.g. 123 Main St, City"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                placeholder="Brief description of the community..."
                                className="min-h-[100px]"
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
                            {imageUrl && (
                                <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                                    <img
                                        src={imageUrl}
                                        alt="Community preview"
                                        className="object-cover w-full h-full"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={updating} className="gap-2">
                                <Save className="h-4 w-4" />
                                {updating ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
