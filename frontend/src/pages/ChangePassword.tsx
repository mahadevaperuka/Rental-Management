import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

import { useMutation } from "@apollo/client/react"
import { COMPLETE_TEMP_PASSWORD } from "@/graphql/mutations"

export default function ChangePassword() {
    const { data: session } = authClient.useSession()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [completeTempPassword] = useMutation(COMPLETE_TEMP_PASSWORD)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match")
            return
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        try {
            const { error } = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: true
            })

            if (error) {
                setError(error.message || "Failed to change password")
            } else {
                // Password changed successfully, now clear the flag
                if (session?.user?.email) {
                    await completeTempPassword({
                        variables: { email: session.user.email }
                    })
                    // Force session refresh or just redirect? 
                    // Redirecting might trigger the check again if session is stale.
                    // We should probably reload the page or manually update session if possible.
                    // But redirecting to dashboard should trigger a re-render/re-check.
                    // If session is still stale, it might loop.
                    // Let's try to reload the window to force session refresh from server.
                    window.location.href = "/dashboard"
                } else {
                    navigate("/dashboard")
                }
            }
        } catch (err) {
            setError("An unexpected error occurred")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Change Temporary Password</CardTitle>
                    <CardDescription>
                        You are required to change your temporary password before continuing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">Current Password (Temporary)</Label>
                            <Input
                                id="current"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input
                                id="new"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm New Password</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Changing Password..." : "Change Password"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/")}
                        >
                            Back to Home
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
