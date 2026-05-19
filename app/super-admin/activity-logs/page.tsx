import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, getInitials } from "@/lib/utils/helpers"

export const dynamic = 'force-dynamic'

export default async function ActivityLogsPage() {
  const logsData = await prisma.activity_logs.findMany({
    include: {
      users: {
        select: {
          full_name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 100
  })

  const logs = logsData.map((log: any) => ({
    ...log,
    created_at: log.created_at.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="Track all system activities and user actions" />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials((log.users as { full_name: string })?.full_name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{(log.users as { full_name: string })?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{(log.users as { email: string })?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address || "-"}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(log.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}