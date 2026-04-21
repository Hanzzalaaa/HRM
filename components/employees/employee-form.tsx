"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Employee } from "@/lib/types/database"

interface EmployeeFormProps {
  employee?: Employee
  departments: { id: string; name: string }[]
  basePath: string
}

export function EmployeeForm({ employee, departments, basePath }: EmployeeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingEmployeeId, setLoadingEmployeeId] = useState(false)

  const [formData, setFormData] = useState({
    full_name: employee?.user?.full_name || "",
    email: employee?.user?.email || "",
    password: "",
    role: employee?.user?.role || "employee",
    employee_id: employee?.employee_id || "",
    department_id: employee?.department_id || "",
    designation: employee?.designation || "",
    employment_type: employee?.employment_type || "full_time",
    date_of_joining: employee?.date_of_joining
      ? new Date(employee.date_of_joining).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    date_of_birth: employee?.date_of_birth
      ? new Date(employee.date_of_birth).toISOString().split("T")[0]
      : "",
    phone: employee?.phone || "",
    address: employee?.address || "",
    emergency_contact: employee?.emergency_contact || "",
    bank_account: employee?.bank_account || "",
    bank_name: employee?.bank_name || "",
    pan_number: employee?.pan_number || "",
    aadhar_number: employee?.aadhar_number || "",
    basic_salary: employee?.basic_salary?.toString() || "",
  })

  useEffect(() => {
    if (!employee) fetchNextEmployeeId()
  }, [])

  const fetchNextEmployeeId = async () => {
    setLoadingEmployeeId(true)
    try {
      const res = await fetch("/api/employees/next-id")
      const data = await res.json()
      if (data.success) {
        setFormData((prev) => ({ ...prev, employee_id: data.employee_id }))
      }
    } catch {
      console.log("ID fetch failed")
    } finally {
      setLoadingEmployeeId(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.department_id) {
      setError("Department is required")
      return
    }

    setLoading(true)

    try {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees"
      const method = employee ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          basic_salary: Number(formData.basic_salary) || 0,
          date_of_birth: formData.date_of_birth || null,
          phone: formData.phone || null,
          address: formData.address || null,
          emergency_contact: formData.emergency_contact || null,
          bank_account: formData.bank_account || null,
          bank_name: formData.bank_name || null,
          pan_number: formData.pan_number || null,
          aadhar_number: formData.aadhar_number || null,
        }),
      })

      const text = await res.text()
      let data: any = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("JSON PARSE ERROR:", parseError)
      }

      if (!res.ok) {
        setError(data?.error || "Failed to save employee")
        return
      }

      router.push(`${basePath}/employees`)
      router.refresh()

    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Full Name" value={formData.full_name} onChange={(e) => updateField("full_name", e.target.value)} required />
          <Input placeholder="Email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required />
          {!employee && (
            <Input placeholder="Password" type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} required />
          )}
          <Select value={formData.role} onValueChange={(v) => updateField("role", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input value={formData.employee_id} disabled placeholder="Employee ID" />
          <Select value={formData.department_id} onValueChange={(v) => updateField("department_id", v)}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Designation" value={formData.designation} onChange={(e) => updateField("designation", e.target.value)} required />
          <Select value={formData.employment_type} onValueChange={(v) => updateField("employment_type", v)}>
            <SelectTrigger><SelectValue placeholder="Employment Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={formData.date_of_joining} onChange={(e) => updateField("date_of_joining", e.target.value)} />
          <Input type="number" placeholder="Salary (PKR)" value={formData.basic_salary} onChange={(e) => updateField("basic_salary", e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin mr-2" />}
          {employee ? "Update Employee" : "Create Employee"}
        </Button>
      </div>
    </form>
  )
}