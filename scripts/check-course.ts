
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'ai-productivity-adaptation';
    const course = await prisma.course.findUnique({
        where: { slug },
        include: { nodes: true },
    });

    if (course) {
        console.log(`FOUND COURSE: ${course.title}`);
        console.log(`Node Count: ${course.nodes.length}`);
    } else {
        console.log('COURSE NOT FOUND');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
