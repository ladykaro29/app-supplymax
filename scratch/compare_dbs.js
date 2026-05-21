const { execSync } = require('child_process');

function getCount(path) {
    try {
        const output = execSync(`npx prisma db pull --print`, {
            env: { ...process.env, DATABASE_URL: `file:${path}` }
        }).toString();
        // Just a hacky way to check if it has tables
        return output.length > 100 ? "Has schema" : "Empty";
    } catch (e) {
        return "Error/Missing";
    }
}

console.log('Root dev.db:', getCount('./dev.db'));
console.log('Prisma dev.db:', getCount('./prisma/dev.db'));
