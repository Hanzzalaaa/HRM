"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, DollarSign, Calendar, TrendingUp, Loader2 } from "lucide-react"

const reports = [
  {
    title: "Employee Report",
    description: "Complete list of all employees with their details",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    endpoint: "/api/reports/employees",
    filename: "employees.csv",
  },
  {
    title: "Attendance Report",
    description: "Monthly attendance summary for all employees",
    icon: Calendar,
    color: "bg-emerald-100 text-emerald-600",
    endpoint: "/api/reports/attendance",
    filename: "attendance.csv",
  },
  {
    title: "Payroll Report",
    description: "Detailed salary and payment information",
    icon: DollarSign,
    color: "bg-amber-100 text-amber-600",
    endpoint: "/api/reports/payroll",
    filename: "payroll.csv",
  },
  {
    title: "Leave Report",
    description: "Leave statistics and balance summary",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
    endpoint: "/api/reports/leaves",
    filename: "leaves.csv",
  },
]

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (endpoint: string, filename: string) => {
    setDownloading(filename)
    setError(null)
    try {
      const res = await fetch(endpoint)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Failed to download ${filename}`)
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError(`Failed to download ${filename}. Please try again.`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and download various reports" />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.color}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                disabled={downloading === report.filename}
                onClick={() => handleDownload(report.endpoint, report.filename)}
              >
                {downloading === report.filename ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
