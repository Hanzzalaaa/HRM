import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json()

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
    }

    const employees = await prisma.employees.findMany({
      include: { users: true }
    })

    const activeEmployees = employees.filter(emp => emp.users.status === 'active')

    const results = []

    for (const emp of activeEmployees) {
      const existing = await prisma.salaries.findFirst({
        where: { employee_id: emp.id, month, year }
      })

      if (!existing) {
        const basic = emp.basic_salary
        const hra = basic * 0.4
        const da = basic * 0.1
        const ta = basic * 0.05
        const medical = basic * 0.05
        const other_allowances = 0
        const gross_salary = basic + hra + da + ta + medical + other_allowances
        const pf_deduction = basic * 0.12
        const tax_deduction = gross_salary * 0.1
        const other_deductions = 0
        const net_salary = gross_salary - pf_deduction - tax_deduction - other_deductions

        const salary = await prisma.salaries.create({
          data: {
            id: crypto.randomUUID(),
            employee_id: emp.id,
            month,
            year,
            basic_salary: basic,
            hra,
            da,
            ta,
            medical,
            other_allowances,
            pf_deduction,
            tax_deduction,
            other_deductions,
            gross_salary,
            net_salary,
            payment_status: 'pending',
            updated_at: new Date()
          }
        })
        results.push(salary)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${results.length} payroll records generated!` 
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate payroll' }, { status: 500 })
  }
}