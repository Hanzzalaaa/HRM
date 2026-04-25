import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['super_admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '1')
    const year = parseInt(searchParams.get('year') || '2024')

    const salaries = await prisma.salaries.findMany({
      where: { month, year },
      include: {
        employees: {
          select: {
            employee_id: true,
            designation: true,
            users: { select: { full_name: true, email: true } },
            departments_employees_department_idTodepartments: { select: { name: true } },
          },
        },
      },
    })

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

    const csvRows = [
      ['Employee Name', 'Employee ID', 'Email', 'Department', 'Designation', 'Basic Salary', 'HRA', 'DA', 'TA', 'Medical', 'Gross Salary', 'PF Deduction', 'Tax Deduction', 'Net Salary', 'Status'],
      ...salaries.map(s => [
        `"${s.employees.users.full_name}"`,
        s.employees.employee_id,
        s.employees.users.email,
        `"${s.employees.departments_employees_department_idTodepartments?.name || ''}"`,
        `"${s.employees.designation}"`,
        s.basic_salary,
        s.hra,
        s.da,
        s.ta,
        s.medical,
        s.gross_salary,
        s.pf_deduction,
        s.tax_deduction,
        s.net_salary,
        s.payment_status,
      ]),
    ]

    const csv = csvRows.map(row => row.join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payroll-${monthNames[month - 1]}-${year}.csv"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to export payroll' }, { status: 500 })
  }
}