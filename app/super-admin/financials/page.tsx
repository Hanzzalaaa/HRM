import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils/helpers"

export default async function FinancialsPage() {
  const currentYear = new Date().getFullYear()

  const financials = await prisma.company_financials.findMany({
    where: {
      year: currentYear
    },
    orderBy: {
      month: 'asc'
    }
  })

  const currentMonth = financials?.find((f: any) => f.month === new Date().getMonth() + 1)
  const previousMonth = financials?.find((f: any) => f.month === new Date().getMonth())

  const yearlyTotals = financials?.reduce(
    (acc: any, f: any) => ({
      revenue: acc.revenue + Number(f.total_revenue),
      expenses: acc.expenses + Number(f.total_expenses),
      profit: acc.profit + Number(f.net_profit),
    }),
    { revenue: 0, expenses: 0, profit: 0 },
  ) || { revenue: 0, expenses: 0, profit: 0 }

  const revenueChange = previousMonth
    ? (((currentMonth?.total_revenue || 0) - (previousMonth.total_revenue || 0)) / (previousMonth.total_revenue || 1)) *
      100
    : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Company Financials" description="Track company revenue, expenses, and profitability" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(currentMonth?.total_revenue || 0)}
          icon={TrendingUp}
          trend={revenueChange !== 0 ? { value: Math.abs(revenueChange), isPositive: revenueChange > 0 } : undefined}
          description="vs last month"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(currentMonth?.total_expenses || 0)}
          icon={TrendingDown}
          description="Total expenditure"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(currentMonth?.net_profit || 0)}
          icon={DollarSign}
          description="After all deductions"
        />
        <StatCard
          title="Salary Expenses"
          value={formatCurrency(currentMonth?.salary_expenses || 0)}
          icon={Wallet}
          description="Employee salaries"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yearly Summary - {currentYear}</CardTitle>
          <CardDescription>Financial overview for the current fiscal year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(yearlyTotals.revenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(yearlyTotals.expenses)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <PiggyBank className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(yearlyTotals.profit)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentMonth && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Current month expense distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Salary Expenses</span>
                <span className="font-medium">{formatCurrency(currentMonth.salary_expenses || 0)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${((currentMonth.salary_expenses || 0) / (currentMonth.total_expenses || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Operational Expenses</span>
                <span className="font-medium">{formatCurrency(currentMonth.operational_expenses || 0)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${((currentMonth.operational_expenses || 0) / (currentMonth.total_expenses || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Marketing Expenses</span>
                <span className="font-medium">{formatCurrency(currentMonth.marketing_expenses || 0)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${((currentMonth.marketing_expenses || 0) / (currentMonth.total_expenses || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Other Expenses</span>
                <span className="font-medium">{formatCurrency(currentMonth.other_expenses || 0)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${((currentMonth.other_expenses || 0) / (currentMonth.total_expenses || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}