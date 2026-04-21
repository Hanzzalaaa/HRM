import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { AnnouncementsList } from "@/components/announcements/announcements-list"

export default async function EmployeeAnnouncementsPage() {
  const announcements = await prisma.announcements.findMany({
    where: {
      is_active: true,
    },
    include: {
      users: {
        select: {
          full_name: true
        }
      }
    },
    orderBy: [
      { created_at: 'desc' }
    ]
  })

  const formattedAnnouncements = announcements.map((announcement: any) => ({
    ...announcement,
    created_at: announcement.created_at.toISOString(),
    updated_at: announcement.updated_at.toISOString(),
    published_at: announcement.published_at?.toISOString() ?? undefined,
    expires_at: announcement.expires_at?.toISOString() ?? undefined,
    author: announcement.users
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" description="Company-wide announcements and updates" />

      <AnnouncementsList announcements={formattedAnnouncements} isAdmin={false} />
    </div>
  )
}