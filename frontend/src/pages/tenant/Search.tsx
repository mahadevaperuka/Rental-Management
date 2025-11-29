import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"
import { useState } from "react"

const GET_UNITS = gql`
  query GetUnits($filter: FilterFindManyUnitInput) {
    unitMany(filter: $filter) {
        _id
        apartment_no
        bedrooms
        bathrooms
        rent
        status
      community {
            _id
            name
            location
        }
    }
}
`

export default function TenantSearch() {
    const [searchTerm, setSearchTerm] = useState("")
    const { data, loading, error } = useQuery<any>(GET_UNITS, {
        variables: {
            filter: {
                status: "Available" // Only show available units
            }
        }
    })

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
                    {filteredUnits.map((unit: any) => (
                        <Card key={unit._id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-gray-100 relative">
                                {unit.images?.[0] ? (
                                    <img
                                        src={unit.images[0]}
                                        alt={`Unit ${unit.apartment_no} `}
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <Building2 className="h-12 w-12" />
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
                                <Button className="w-full">View Details & Apply</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

// Helper icon since I used it in the conditional render but forgot to import it
import { Building2 } from "lucide-react"
