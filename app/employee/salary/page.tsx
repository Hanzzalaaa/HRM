import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Download, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, getStatusColor } from "@/lib/utils/helpers"
import { redirect } from "next/navigation"

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default async function EmployeeSalaryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const employee = await prisma.employee.findUnique({
    where: { user_id: user.id },
    select: { 
      id: true, 
      basic_salary: true 
    }
  })

  if (!employee) return null

  const salaries = await prisma.salary.findMany({
    where: {
      employee_id: employee.id
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  })

  const latestSalary = salaries[0]

  return (
    <div className="space-y-6">
      <PageHeader title="My Salary" description="View your salary details and payment history" />

      {/* Current Salary Summary */}
      {latestSalary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Basic Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(latestSalary.basic_salary))}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gross Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{formatCurrency(Number(latestSalary.gross_salary))}</div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    Number(latestSalary.pf_deduction || 0) +
                      Number(latestSalary.tax_deduction || 0) +
                      Number(latestSalary.other_deductions || 0),
                  )}
                </div>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(Number(latestSalary.net_salary))}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest Payslip Details */}
      {latestSalary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Breakdown - {monthNames[latestSalary.month - 1]} {latestSalary.year}
              </CardTitle>
              <CardDescription>Detailed view of your latest salary</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Payslip
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Earnings */}
              <div>
                <h4 className="font-semibold mb-4 text-emerald-600">Earnings</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.basic_salary))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">HRA</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.hra || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Dearness Allowance</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.da || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Travel Allowance</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.ta || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Medical Allowance</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.medical || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Other Allowances</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.other_allowances || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold text-emerald-600">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(Number(latestSalary.gross_salary))}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-semibold mb-4 text-red-600">Deductions</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Provident Fund</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.pf_deduction || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Income Tax (TDS)</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.tax_deduction || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Other Deductions</span>
                    <span className="font-medium">{formatCurrency(Number(latestSalary.other_deductions || 0))}</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold text-red-600">
                    <span>Total Deductions</span>
                    <span>
                      {formatCurrency(
                        Number(latestSalary.pf_deduction || 0) +
                          Number(latestSalary.tax_deduction || 0) +
                          Number(latestSalary.other_deductions || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Net Salary</span>
                <span className="text-2xl font-bold text-emerald-600">{formatCurrency(Number(latestSalary.net_salary))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your salary payment records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!salaries || salaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No salary records found.
                  </TableCell>
                </TableRow>
              ) : (
                salaries.map((salary: any) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                      {monthNames[salary.month - 1]} {salary.year}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(salary.gross_salary))}</TableCell>
                    <TableCell className="text-right text-red-600">
                      -
                      {formatCurrency(
                        Number(salary.pf_deduction || 0) + Number(salary.tax_deduction || 0) + Number(salary.other_deductions || 0),
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(Number(salary.net_salary))}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(salary.payment_status)}>{salary.payment_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
