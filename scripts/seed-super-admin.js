const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'hassank1751@gmail.com'
  const password = 'oyehoye213'
  const fullName = 'Hassan Kashif'

  console.log('🔍 Checking if super admin already exists...')

  // Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('✅ Super admin user already exists!')
    console.log(`   Email: ${email}`)
    console.log(`   Role: ${existingUser.role}`)
    return
  }

  console.log('🔐 Hashing password...')
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log('👤 Creating super admin user...')
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      full_name: fullName,
      role: 'super_admin',
      status: 'active'
    }
  })

  console.log('✅ Super admin created successfully!')
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Name: ${user.full_name}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Status: ${user.status}`)
  console.log('\n🎉 You can now login with:')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
