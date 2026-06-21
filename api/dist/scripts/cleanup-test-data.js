"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const result = await prisma.property.deleteMany({
        where: { scrapedFrom: 'realestateonline.gr' },
    });
    console.log(`Deleted ${result.count} test properties`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=cleanup-test-data.js.map