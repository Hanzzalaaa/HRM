"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Users, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils/helpers"

interface Department {
  id: string
  name: string
  description?: string
  head?: {
    id: string
    users: { full_name: string }
  }
  employeeCount: number
}

interface DepartmentListProps {
  departments: Department[]
}

export function DepartmentList({ departments }: DepartmentListProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Department name is required")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      const data = await res.json()
      if (data.success) {
        setOpen(false)
        setName("")
        setDescription("")
        router.refresh()
      } else {
        setError(data.error || 'Failed to create department')
      }
    } catch {
      setError('Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" department?`)) return
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.error || 'Failed to delete department')
      }
    } catch {
      alert('Something went wrong!')
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{department.name}</CardTitle>
                <CardDescription className="mt-1">{department.description || "No description"}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(department.id, department.name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{department.employeeCount} employees</span>
                </div>
                {department.head && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(department.head.users.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{department.head.users.full_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}