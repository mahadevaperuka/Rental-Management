import { useQuery, useMutation } from "@apollo/client/react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search as SearchIcon, Building2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { GET_UNITS, GET_MY_APPLICATIONS } from "@/graphql/queries"
import { CREATE_APPLICATION } from "@/graphql/mutations"
import { authClient } from "@/lib/auth-client"

export default function TenantSearch() {
    const { data: session } = authClient.useSession()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
    const [isApplyOpen, setIsApplyOpen] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "")
            setEmail(session.user.email || "")
            // We don't pre-fill phone as it might not be in the session or user might want to provide a different one
        }
    }, [session])

    const { data, loading, error } = useQuery<any>(GET_UNITS, {
        variables: {
            filter: {
                status: "Available"
            }
        }
    })

    const { data: myApplicationsData, refetch: refetchApplications } = useQuery<any>(GET_MY_APPLICATIONS, {
        variables: {
            email: session?.user?.email
        },
        skip: !session?.user?.email
    })

    const [createApplication, { loading: applying }] = useMutation(CREATE_APPLICATION, {
        onCompleted: () => {
            setIsApplyOpen(false)
            setSelectedUnit(null)
            refetchApplications()
            alert("Application submitted successfully!")
        },
        onError: (err) => {
            alert(`Failed to submit application: ${err.message}`)
        }
    })

    const handleApplyClick = (unitId: string) => {
        setSelectedUnit(unitId)
        setIsApplyOpen(true)
    }

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUnit) return

        try {
            await createApplication({
                variables: {
                    record: {
                        apartment_id: selectedUnit,
                        applicant_name: name,
                        email,
                        phone,
                        status: "Pending",
                        date_applied: new Date().toISOString()
                    }
                }
            })
        } catch (err) {
            console.error("Error submitting application:", err)
        }
    }

    const getApplicationStatus = (unitId: string) => {
        const application = myApplicationsData?.applicationMany?.find(
            (app: any) => app.unit?._id === unitId && (app.status === 'Pending' || app.status === 'Approved')
        )
        return application ? application.status : null
    }

    const filteredUnits = data?.unitMany?.filter((unit: any) =>
        unit.community?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.community?.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    if (loading) return <div className="flex justify-center p-8">Loading available homes...</div>
    if (error) return <div className="text-red-500 p-8">Error loading units: {error.message}</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Find Your New Home</h1>
                    <p className="text-gray-500">Browse available apartments in our communities.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by community or location..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredUnits.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">No available units found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUnits.map((unit: any) => {
                        const status = getApplicationStatus(unit._id)
                        const isApplied = !!status

                        return (
                            <Card key={unit._id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100 relative">
                                    {unit.images?.[0] ? (
                                        <img
                                            src={unit.images[0]}
                                            alt={`Unit ${unit.apartment_no} `}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Building2 className="h-12 w-12" />
                                        </div>
                                    )}
                                    {isApplied && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Applied
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{unit.community?.name}</CardTitle>
                                            <p className="text-sm text-gray-500">{unit.community?.location}</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-black text-white shadow hover:bg-black/80">
                                            {unit.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Unit</span>
                                            <span className="font-medium">{unit.apartment_no}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Layout</span>
                                            <span className="font-medium">{unit.bedrooms} Bed / {unit.bathrooms} Bath</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Rent</span>
                                            <span className="font-medium">${unit.rent}/mo</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleApplyClick(unit._id)}
                                        disabled={isApplied || applying}
                                        variant={isApplied ? "outline" : "default"}
                                    >
                                        {isApplied ? "Applied" : "Apply Now"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Apply for Apartment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                readOnly
                                className="bg-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                readOnly
                                className="bg-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="(555) 123-4567"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={applying}>
                                {applying ? "Submitting..." : "Submit Application"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
