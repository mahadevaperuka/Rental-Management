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
    // Check if the user is forced to change their password
    const isForced = (session?.user as any)?.is_temp_password

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
                // If this was a forced change, mark it as complete in our DB
                if (isForced) {
                    await completeTempPassword()
                }

                // Redirect based on outcome
                if (isForced) {
                    // Force refresh for forced changes to update session
                    window.location.href = "/dashboard"
                } else {
                    // For voluntary changes, just navigate back
                    navigate(-1)
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
                    <CardTitle>
                        {isForced ? "Change Temporary Password" : "Change Password"}
                    </CardTitle>
                    <CardDescription>
                        {isForced
                            ? "You are required to change your temporary password before continuing."
                            : "Update your password below."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">
                                {isForced ? "Current Password (Temporary)" : "Current Password"}
                            </Label>
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

                        <div className="flex flex-col gap-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Changing Password..." : "Change Password"}
                            </Button>

                            {!isForced && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            )}

                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
