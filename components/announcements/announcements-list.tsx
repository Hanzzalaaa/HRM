"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Bell, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { formatDate, getPriorityColor } from "@/lib/utils/helpers"

interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  target_roles: string[]
  is_active: boolean
  published_at?: string
  expires_at?: string
  created_at?: string
  author?: { full_name: string }
}

interface AnnouncementsListProps {
  announcements: Announcement[]
  isAdmin?: boolean
}

const priorityIcons = {
  low: Info,
  medium: Bell,
  high: AlertTriangle,
  urgent: AlertCircle,
}

export function AnnouncementsList({ announcements, isAdmin = false }: AnnouncementsListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.error || "Failed to delete announcement")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (id: string) => {
    // Use the basePath from the current URL to support both /super-admin and /hr
    const path = window.location.pathname
    const base = path.startsWith("/super-admin") ? "/super-admin" : "/hr"
    router.push(`${base}/announcements/${id}/edit`)
  }

  return (
    <div className="space-y-4">
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No announcements found.</CardContent>
        </Card>
      ) : (
        announcements.map((announcement) => {
          const PriorityIcon = priorityIcons[announcement.priority as keyof typeof priorityIcons] || Bell

          return (
            <Card key={announcement.id} className={!announcement.is_active ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      announcement.priority === "urgent"
                        ? "bg-red-100 text-red-600"
                        : announcement.priority === "high"
                          ? "bg-orange-100 text-orange-600"
                          : announcement.priority === "medium"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <PriorityIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <CardDescription className="mt-1">
                      By {announcement.author?.full_name || "System"} •{" "}
                      {formatDate(announcement.published_at || announcement.created_at || new Date().toISOString())}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                  {!announcement.is_active && <Badge variant="outline">Inactive</Badge>}
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(announcement.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(announcement.id)}
                          disabled={deletingId === announcement.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === announcement.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                {announcement.target_roles && announcement.target_roles.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Visible to:</span>
                    {announcement.target_roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs capitalize">
                        {role.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                )}
                {announcement.expires_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Expires: {formatDate(announcement.expires_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}