import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, History } from "lucide-react"

const GET_MY_PAYMENTS = gql`
  query GetMyPayments($filter: FilterFindManyPaymentInput) {
    paymentMany(filter: $filter) {
      _id
      amount
      payment_date
      status
      payment_method
    }
  }
`

export default function TenantPayments() {
    const { data: session } = authClient.useSession()
    const { data, loading, error } = useQuery<any>(GET_MY_PAYMENTS, {
        variables: {
            filter: {
                tenant_id: (session?.user as any)?.linked_id
            }
        },
        skip: !session?.user.id
    })

    if (loading) return <div className="flex justify-center p-8">Loading payments...</div>
    if (error) return <div className="text-red-500 p-8">Error loading payments: {error.message}</div>

    const payments = data?.paymentMany || []

    // Calculate next payment (mock logic for now as we don't have a "next payment" field)
    const nextPaymentAmount = 1200.00
    const nextPaymentDate = new Date()
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
    nextPaymentDate.setDate(1)

    // Get last payment
    const lastPayment = payments.length > 0 ? payments[0] : null

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
                <Button className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Make a Payment
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Next Payment Due</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${nextPaymentAmount.toFixed(2)}</div>
                        <p className="text-xs text-gray-500 mt-1">Due {nextPaymentDate.toLocaleDateString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Last Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${lastPayment ? lastPayment.amount.toFixed(2) : '0.00'}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {lastPayment ? `Paid on ${new Date(lastPayment.payment_date).toLocaleDateString()}` : 'No recent payments'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Current</div>
                        <p className="text-xs text-gray-500 mt-1">No overdue balance</p>
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
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No payment history found.</td>
                                    </tr>
                                ) : (
                                    payments.map((payment: any) => (
                                        <tr key={payment._id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
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
