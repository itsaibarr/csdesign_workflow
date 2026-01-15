import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
    console.log('🔍 Checking demo users...\n')

    const student = await prisma.user.findUnique({
        where: { email: 'student@csc.com' },
        include: {
            accounts: true
        }
    })

    const mentor = await prisma.user.findUnique({
        where: { email: 'mentor@csc.com' },
        include: {
            accounts: true
        }
    })

    if (student) {
        console.log('✅ Student found:')
        console.log('   Email:', student.email)
        console.log('   Name:', student.name)
        console.log('   Role:', student.role)
        console.log('   Has credentials:', student.accounts.length > 0)
    } else {
        console.log('❌ Student not found')
    }

    console.log('')

    if (mentor) {
        console.log('✅ Mentor found:')
        console.log('   Email:', mentor.email)
        console.log('   Name:', mentor.name)
        console.log('   Role:', mentor.role)
        console.log('   Has credentials:', mentor.accounts.length > 0)
    } else {
        console.log('❌ Mentor not found')
    }

    await prisma.$disconnect()
}

checkUsers()
