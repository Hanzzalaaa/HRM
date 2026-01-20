import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AnnouncementsList } from "@/components/announcements/announcements-list"

export default async function HRAnnouncementsPage() {
  const announcementsData = await prisma.announcement.findMany({
    include: {
      author: {
        select: {
          full_name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Transform to match component's expected structure
  const announcements = announcementsData.map((announcement: any) => ({
    ...announcement,
    created_at: announcement.created_at.toISOString(),
    updated_at: announcement.updated_at.toISOString(),
    published_at: announcement.published_at?.toISOString() ?? undefined,
    expires_at: announcement.expires_at?.toISOString() ?? undefined,
    author: announcement.author
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Manage company-wide announcements"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        }
      />

      <AnnouncementsList announcements={announcements} isAdmin={true} />
    </div>
  )
}
