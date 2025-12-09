import { useQuery, useMutation } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CREATE_PAYMENT } from "@/graphql/mutations"
import { GET_MY_LEASE, GET_MY_PAYMENTS } from "@/graphql/queries"
import { CreditCard, History, Home } from "lucide-react"
import { useState } from "react"

export default function TenantPayments() {
    const { data: session } = authClient.useSession()
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("Credit Card")
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
    const [transactionId, setTransactionId] = useState("")
    const [receiptUrl, setReceiptUrl] = useState("")
    const [selectedLeaseId, setSelectedLeaseId] = useState("")

    // Fetch payments
    const { data: paymentData, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useQuery<any>(GET_MY_PAYMENTS, {
        variables: {
            filter: {
                tenant_id: (session?.user as any)?.linked_id
            }
        },
        skip: !(session?.user as any)?.linked_id
    })

    // Fetch leases for rent amount
    const { data: leaseData, loading: leaseLoading, refetch: refetchLease } = useQuery<any>(GET_MY_LEASE, {
        variables: {
            filter: {
                tenant_id: (session?.user as any)?.linked_id,
                status: "Active"
            }
        },
        skip: !(session?.user as any)?.linked_id
    })

    const [createPayment, { loading: paying }] = useMutation(CREATE_PAYMENT, {
        onCompleted: () => {
            setIsPaymentOpen(false)
            setAmount("")
            setTransactionId("")
            setReceiptUrl("")
            setPaymentDate(new Date().toISOString().split('T')[0])
            refetchPayments()
            refetchLease() // Refetch lease to get updated next_payment_date
            alert("Payment submitted successfully!")
        },
        onError: (err) => {
            alert(`Payment failed: ${err.message}`)
        }
    })

    if (paymentsLoading || leaseLoading) return <div className="flex justify-center p-8">Loading payments...</div>
    if (paymentsError) return <div className="text-red-500 p-8">Error loading payments: {paymentsError.message}</div>

    const payments = paymentData?.paymentMany || []
    const leases = leaseData?.leaseMany || []

    // If no lease, show empty state
    if (leases.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">No Active Leases</h2>
                    <p className="text-gray-500">You need an active lease to view payment information.</p>
                </div>
            </div>
        )
    }



    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const leaseIdToUse = selectedLeaseId || leases[0]?._id
        if (!leaseIdToUse || !session?.user) return

        try {
            await createPayment({
                variables: {
                    record: {
                        tenant_id: (session.user as any).linked_id,
                        lease_id: leaseIdToUse,
                        amount: parseFloat(amount),
                        payment_method: paymentMethod,
                        transaction_id: transactionId,
                        status: "Paid",
                        payment_date: new Date(paymentDate).toISOString(),
                        receipt_url: receiptUrl
                    }
                }
            })
        } catch (err) {
            console.error("Payment error:", err)
        }
    }

    const renderLeaseSection = (lease: any) => {
        // Filter payments for this specific lease
        // Fallback: if payment.lease is not populated yet, we might show all (backward compat) 
        // but strictly we should check payment.lease._id
        const leasePayments = payments.filter((p: any) => p.lease?._id === lease._id)
            .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

        const nextPaymentAmount = lease.monthly_rent
        // Use persisted next_payment_date from lease
        const nextPaymentDate = lease.next_payment_date ? new Date(lease.next_payment_date) : new Date();

        // Get last payment
        const lastPayment = leasePayments.length > 0 ? leasePayments[0] : null

        // Calculate Payment Status
        const calculateStatus = () => {
            if (!leasePayments.length) return { status: "Overdue", color: "text-red-600", message: "No payments made" }

            const lastPaymentDate = new Date(lastPayment.payment_date)
            const today = new Date()
            const currentMonth = today.getMonth()
            const currentYear = today.getFullYear()

            // Payment date is stored as UTC midnight. Use UTC getters to get the "intended" date.
            const paymentMonth = lastPaymentDate.getUTCMonth()
            const paymentYear = lastPaymentDate.getUTCFullYear()

            // If payment matches current month/year OR is for a future month/year
            const isPaidForCurrentOrFuture = (paymentYear > currentYear) ||
                (paymentYear === currentYear && paymentMonth >= currentMonth)

            if (isPaidForCurrentOrFuture) {
                return { status: "Current", color: "text-green-600", message: "Paid for this month" }
            } else {
                if (today.getDate() > 5) {
                    return { status: "Overdue", color: "text-red-600", message: "Payment overdue" }
                } else {
                    return { status: "Due", color: "text-yellow-600", message: "Payment due soon" }
                }
            }
        }

        const paymentStatus = calculateStatus()

        return (
            <div key={lease._id} className="space-y-6 border border-gray-200 rounded-xl p-6 bg-white/50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Home className="h-5 w-5 text-gray-500" />
                        Unit {lease.unit?.apartment_no} - {lease.unit?.community?.name}
                    </h2>
                    <Button className="gap-2" onClick={() => {
                        setSelectedLeaseId(lease._id)
                        setAmount(lease.monthly_rent.toString())
                        setIsPaymentOpen(true)
                    }}>
                        <CreditCard className="h-4 w-4" />
                        Make Payment
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Next Payment Due</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${nextPaymentAmount.toFixed(2)}</div>
                            <p className="text-xs text-gray-500 mt-1">Due {formatDate(nextPaymentDate)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Last Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lastPayment ? `$${lastPayment.amount.toFixed(2)}` : 'Not Paid'}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {lastPayment ? `Paid on ${formatDate(lastPayment.payment_date)}` : 'No payment record found'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${paymentStatus.color}`}>{paymentStatus.status}</div>
                            <p className="text-xs text-gray-500 mt-1">{paymentStatus.message}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Payment History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Method</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leasePayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No payment history found for this unit.</td>
                                        </tr>
                                    ) : (
                                        leasePayments.map((payment: any) => (
                                            <tr key={payment._id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3">{formatDate(payment.payment_date)}</td>
                                                <td className="px-4 py-3 font-medium">${payment.amount.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${payment.status === 'Paid' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        payment.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                            'bg-red-50 text-red-700 ring-red-600/20'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{payment.payment_method}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

            {leases.map(renderLeaseSection)}

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Make a Payment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Payment Amount ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                readOnly
                                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentDate">Payment Date</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transactionId">Transaction ID</Label>
                                <Input
                                    id="transactionId"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="e.g. TXN-123456"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receiptUrl">Receipt URL (Optional)</Label>
                            <Input
                                id="receiptUrl"
                                value={receiptUrl}
                                onChange={(e) => setReceiptUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={paying}>
                                {paying ? "Processing..." : "Pay Now"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}
