"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
      ? (typeof employee.date_of_joining === 'string' 
          ? employee.date_of_joining.split("T")[0] 
          : new Date(employee.date_of_joining).toISOString().split("T")[0])
      : new Date().toISOString().split("T")[0],
    date_of_birth: employee?.date_of_birth 
      ? (typeof employee.date_of_birth === 'string' 
          ? employee.date_of_birth.split("T")[0] 
          : new Date(employee.date_of_birth).toISOString().split("T")[0])
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

  // Fetch next employee ID when creating new employee
  useEffect(() => {
    if (!employee) {
      fetchNextEmployeeId()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNextEmployeeId = async () => {
    setLoadingEmployeeId(true)
    try {
      const response = await fetch('/api/employees/next-id')
      const data = await response.json()
      
      if (data.success && data.employee_id) {
        setFormData(prev => ({ ...prev, employee_id: data.employee_id }))
      }
    } catch (error) {
      console.error('Failed to fetch employee ID:', error)
    } finally {
      setLoadingEmployeeId(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint = employee 
        ? `/api/employees/${employee.id}` 
        : '/api/employees'
      
      const method = employee ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          basic_salary: Number.parseFloat(formData.basic_salary) || 0,
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

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save employee')
        return
      }

      router.push(`${basePath}/employees`)
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
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

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>User account details for authentication</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              disabled={!!employee}
            />
          </div>
          {!employee && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => updateField("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
          <CardDescription>Job-related information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee ID *</Label>
            <div className="flex gap-2">
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => updateField("employee_id", e.target.value)}
                required
                placeholder="e.g., EMP001"
                disabled={!!employee || loadingEmployeeId}
                className={loadingEmployeeId ? "animate-pulse" : ""}
              />
              {!employee && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchNextEmployeeId}
                  disabled={loadingEmployeeId}
                  title="Generate new Employee ID"
                >
                  {loadingEmployeeId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "↻"
                  )}
                </Button>
              )}
            </div>
            {!employee && (
              <p className="text-xs text-muted-foreground">
                Auto-generated. Click ↻ to generate a new ID.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department_id">Department *</Label>
            <Select value={formData.department_id} onValueChange={(value) => updateField("department_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => updateField("designation", e.target.value)}
              required
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type *</Label>
            <Select value={formData.employment_type} onValueChange={(value) => updateField("employment_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_joining">Date of Joining *</Label>
            <Input
              id="date_of_joining"
              type="date"
              value={formData.date_of_joining}
              onChange={(e) => updateField("date_of_joining", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basic_salary">Basic Salary (INR) *</Label>
            <Input
              id="basic_salary"
              type="number"
              value={formData.basic_salary}
              onChange={(e) => updateField("basic_salary", e.target.value)}
              required
              min="0"
              placeholder="e.g., 50000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => updateField("date_of_birth", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="e.g., +91 9876543210"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Enter full address"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Emergency Contact</Label>
            <Input
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) => updateField("emergency_contact", e.target.value)}
              placeholder="e.g., +91 9876543210"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank & Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bank & Tax Information</CardTitle>
          <CardDescription>Financial and tax-related details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => updateField("bank_name", e.target.value)}
              placeholder="e.g., HDFC Bank"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_account">Bank Account Number</Label>
            <Input
              id="bank_account"
              value={formData.bank_account}
              onChange={(e) => updateField("bank_account", e.target.value)}
              placeholder="Account number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan_number">PAN Number</Label>
            <Input
              id="pan_number"
              value={formData.pan_number}
              onChange={(e) => updateField("pan_number", e.target.value)}
              placeholder="e.g., ABCDE1234F"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aadhar_number">Aadhar Number</Label>
            <Input
              id="aadhar_number"
              value={formData.aadhar_number}
              onChange={(e) => updateField("aadhar_number", e.target.value)}
              placeholder="12-digit Aadhar number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {employee ? "Updating..." : "Creating..."}
            </>
          ) : employee ? (
            "Update Employee"
          ) : (
            "Create Employee"
          )}
        </Button>
      </div>
    </form>
  )
}
