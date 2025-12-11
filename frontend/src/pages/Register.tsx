import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { gql } from "@apollo/client"
import { useMutation } from "@apollo/client/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CREATE_USER_ACCOUNT = gql`
    mutation CreateUserAccount(
        $name: String!, $email: String!, $password: String!, $role: String!, $phone: String
        $dob: Date, $ssn: String, $income: Float, $jobTitle: String, $jobType: String, 
        $city: String, $state: String, $zip: String
    ) {
        userCreateAccount(
            name: $name, email: $email, password: $password, role: $role, phone: $phone
            dob: $dob, ssn: $ssn, income: $income, jobTitle: $jobTitle, jobType: $jobType, 
            city: $city, state: $state, zip: $zip
        ) {
            _id
            email
        }
    }
`;

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [dob, setDob] = useState("")
    const [ssn, setSsn] = useState("")
    const [income, setIncome] = useState("")
    const [jobTitle, setJobTitle] = useState("")
    const [jobType, setJobType] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [zip, setZip] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const [createUser] = useMutation(CREATE_USER_ACCOUNT);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await createUser({
                variables: {
                    name,
                    email,
                    password,
                    role: "Guest", // Still Guest, but now with data
                    phone,
                    dob: dob ? new Date(dob) : null,
                    ssn,
                    income: parseFloat(income) || 0,
                    jobTitle,
                    jobType,
                    city,
                    state,
                    zip
                }
            });

            // Auto-login after successful creation
            await authClient.signIn.email({
                email,
                password
            }, {
                onSuccess: () => {
                    navigate("/dashboard")
                },
                onError: () => {
                    // Start session failed but account created
                    navigate("/login");
                }
            });

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Sign up to find your new home</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ssn">SSN</Label>
                                <Input id="ssn" value={ssn} onChange={(e) => setSsn(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="income">Annual Income</Label>
                                <Input id="income" type="number" value={income} onChange={(e) => setIncome(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobType">Job Type</Label>
                                <Select onValueChange={setJobType} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Freelance">Freelance</SelectItem>
                                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Present Address</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                                <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                                <Input placeholder="Zip Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>
                        <div className="text-sm text-center text-gray-500">
                            Already have an account?{" "}
                            <Link to="/login" className="text-black underline hover:text-gray-700">
                                Sign in
                            </Link>
                        </div>
                        <div className="text-sm text-center">
                            <Link to="/" className="text-gray-500 hover:text-gray-700">
                                Back to Home
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
