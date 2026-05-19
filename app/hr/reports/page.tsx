"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, DollarSign, Calendar, Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

const reports = [
  {
    title: "Employee Report",
    description: "Complete list of all employees with their details",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    type: "employees",
  },
  {
    title: "Attendance Report",
    description: "Monthly attendance summary for all employees",
    icon: Calendar,
    color: "bg-emerald-100 text-emerald-600",
    type: "attendance",
  },
  {
    title: "Payroll Report",
    description: "Detailed salary and payment information",
    icon: DollarSign,
    color: "bg-amber-100 text-amber-600",
    type: "payroll",
  },
  {
    title: "Leave Report",
    description: "Leave statistics and balance summary",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
    type: "leaves",
  },
]

export default function HRReportsPage() {
  const [loadingType, setLoadingType] = useState<string | null>(null)

  const handleDownload = async (type: string, title: string) => {
    setLoadingType(type)
    try {
      const res = await fetch(`/api/reports/${type}`)
      if (!res.ok) throw new Error("Failed")
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Failed to download report")
    } finally {
      setLoadingType(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and download various reports" />

      <div className="grid gap-4 md:grid-cols-2">
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
                className="w-full bg-transparent"
                onClick={() => handleDownload(report.type, report.title)}
                disabled={loadingType === report.type}
              >
                {loadingType === report.type ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {loadingType === report.type ? "Downloading..." : "Download Report"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}