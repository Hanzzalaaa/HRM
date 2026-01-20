"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, CheckCircle, Loader2, User, Lock, Bell } from "lucide-react"
import { getInitials } from "@/lib/utils/helpers"
import { Switch } from "@/components/ui/switch"
import { ChangePasswordModal } from "@/components/settings/change-password-modal"
import type { User as UserType } from "@/lib/types/database"

interface SettingsFormProps {
  user: UserType | null
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    avatar_url: user?.avatar_url || "",
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    leave_updates: true,
    salary_updates: true,
    announcements: true,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || 'Failed to update profile' })
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" })
        router.refresh()
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Please select an image file" })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" })
      return
    }

    setUploadingImage(true)
    setMessage(null)

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setProfileData(p => ({ ...p, avatar_url: base64String }))
        setMessage({ type: "success", text: "Image loaded. Click 'Save Changes' to update." })
        setUploadingImage(false)
      }
      reader.onerror = () => {
        setMessage({ type: "error", text: "Failed to read image file" })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to process image" })
      setUploadingImage(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xl">{getInitials(user?.full_name || "U")}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Change Photo'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. Max size 2MB</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData((p) => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profileData.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Change your account password</p>
              </div>
              <ChangePasswordModal />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
            </div>
            <Switch
              checked={notifications.email_notifications}
              onCheckedChange={(v) => setNotifications((p) => ({ ...p, email_notifications: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Leave Updates</p>
              <p className="text-sm text-muted-foreground">Get notified about leave request status changes</p>
            </div>
            <Switch
              checked={notifications.leave_updates}
              onCheckedChange={(v) => setNotifications((p) => ({ ...p, leave_updates: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Salary Updates</p>
              <p className="text-sm text-muted-foreground">Get notified when salary is processed</p>
            </div>
            <Switch
              checked={notifications.salary_updates}
              onCheckedChange={(v) => setNotifications((p) => ({ ...p, salary_updates: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Announcements</p>
              <p className="text-sm text-muted-foreground">Receive notifications for new announcements</p>
            </div>
            <Switch
              checked={notifications.announcements}
              onCheckedChange={(v) => setNotifications((p) => ({ ...p, announcements: v }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
