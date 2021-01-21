const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
    const newLink = prisma.link.create({
        data: {
            description: 'Fullstack tutorial for GraphQL',
            url: 'www.howtographql.com'
        },
    })

    const allLinks = prisma.link.findMany().then((links) => console.log(links))
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })