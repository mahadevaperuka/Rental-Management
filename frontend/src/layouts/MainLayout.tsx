import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Link, Outlet } from "react-router-dom"
import { LogOut, Building2 } from "lucide-react"
import { ChatWidget } from "@/components/ChatWidget"

export default function MainLayout() {
    const { data: session } = authClient.useSession()

    const handleSignOut = async () => {
        await authClient.signOut()
        window.location.href = "/"
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            {/* Top Navigation */}
            <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <Building2 className="h-6 w-6" />
                        <span>OrgLiving</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {session && (
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-right hidden md:block">
                                    <p className="font-medium">{session.user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{(session.user as any).role || 'Tenant'}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </Button>
                            </div>
                        )}
                        {!session && (
                            <Link to="/login">
                                <Button variant="default" size="sm">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-gray-100 py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-gray-400">
                    © 2025 OrgLiving Management. All rights reserved.
                </div>
            </footer>

            {/* Chat Widget */}
            {session && (session.user as any).role !== 'Admin' && <ChatWidget />}
        </div>
    )
}
