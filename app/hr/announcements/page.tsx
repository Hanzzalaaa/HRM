import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AnnouncementsList } from "@/components/announcements/announcements-list"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function HRAnnouncementsPage() {
  const data = await prisma.announcements.findMany({
    include: {
      users: {
        select: { full_name: true },
      },
    },
    orderBy: { created_at: "desc" },
  })

  const announcements = data.map((item: any) => ({
    ...item,
    created_at: item.created_at?.toISOString(),
    updated_at: item.updated_at?.toISOString(),
    published_at: item.published_at?.toISOString() ?? null,
    expires_at: item.expires_at?.toISOString() ?? null,
    author: item.users,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Manage company-wide announcements"
        actions={
          <Link href="/hr/announcements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </Link>
        }
      />
      <AnnouncementsList announcements={announcements} isAdmin={true} />
    </div>
  )
}
