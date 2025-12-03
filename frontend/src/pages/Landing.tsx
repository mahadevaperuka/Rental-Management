import { useQuery } from "@apollo/client/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Building2, Bed, Bath, ArrowRight, CheckCircle2 } from "lucide-react"
import { GET_LANDING_DATA } from "@/graphql/queries"

import { authClient } from "@/lib/auth-client"

export default function Landing() {
    const { data: session } = authClient.useSession()
    const { data, loading, error } = useQuery<any>(GET_LANDING_DATA)

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    if (error) return <div className="text-red-500 p-8">Error loading data: {error.message}</div>

    const communities = data?.communityMany || []

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Building2 className="h-6 w-6" />
                        <span>OrgLiving</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {session ? (
                            <Link to="/dashboard">
                                <Button>Go to Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Find Your Perfect Home
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Browse our curated collection of premium communities and apartments.
                        Experience modern living with top-tier amenities.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="gap-2">
                                View Properties <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Communities Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Our Communities</h2>

                    <div className="space-y-20">
                        {communities.map((community: any) => (
                            <div key={community._id} className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-full md:w-1/3 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        {community.images?.[0] ? (
                                            <img src={community.images[0]} alt={community.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Building2 className="h-12 w-12" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-2">{community.name}</h3>
                                        <p className="text-gray-500 mb-4">{community.location}</p>
                                        <p className="text-gray-600 leading-relaxed">{community.description}</p>

                                        <div className="mt-6 flex gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                {community.units?.length || 0} Total Units
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                {community.units?.filter((u: any) => u.status === 'Available').length || 0} Available
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Unit Types Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Group units by type (e.g. 1 Bed / 1 Bath) */}
                                    {Object.entries(
                                        (community.units || []).reduce((acc: any, unit: any) => {
                                            const key = `${unit.bedrooms} Bed / ${unit.bathrooms} Bath`
                                            if (!acc[key]) acc[key] = []
                                            acc[key].push(unit)
                                            return acc
                                        }, {})
                                    ).map(([type, units]: [string, any]) => {
                                        const availableCount = units.filter((u: any) => u.status === 'Available').length
                                        const minRent = Math.min(...units.map((u: any) => u.rent))

                                        return (
                                            <Card key={type} className="hover:shadow-lg transition-shadow">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span>{type}</span>
                                                        <span className="text-lg font-bold text-green-600">${minRent}+</span>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {availableCount} units available
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex gap-4 text-sm text-gray-500 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <Bed className="h-4 w-4" />
                                                            {units[0].bedrooms} Beds
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Bath className="h-4 w-4" />
                                                            {units[0].bathrooms} Baths
                                                        </div>
                                                    </div>
                                                    <Link to="/login">
                                                        <Button className="w-full" variant="outline">
                                                            Check Availability
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">OrgLiving. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
