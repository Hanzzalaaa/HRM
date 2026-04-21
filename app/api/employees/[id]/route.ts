import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        users: true,
        departments_employees_department_idTodepartments: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: employee })
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      full_name,
      role,
      department_id,
      designation,
      employment_type,
      date_of_joining,
      date_of_birth,
      phone,
      address,
      emergency_contact,
      bank_account,
      bank_name,
      pan_number,
      aadhar_number,
      basic_salary,
    } = body

    const employee = await prisma.employees.findUnique({
      where: { id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.users.update({
        where: { id: employee.user_id },
        data: {
          full_name,
          role,
          updated_at: new Date()
        }
      })

      const updatedEmployee = await tx.employees.update({
        where: { id },
        data: {
          department_id,
          designation,
          employment_type,
          date_of_joining: new Date(date_of_joining),
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          phone: phone || null,
          address: address || null,
          emergency_contact: emergency_contact || null,
          bank_account: bank_account || null,
          bank_name: bank_name || null,
          pan_number: pan_number || null,
          aadhar_number: aadhar_number || null,
          basic_salary,
          updated_at: new Date()
        }
      })

      return { user, employee: updatedEmployee }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.employees.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}