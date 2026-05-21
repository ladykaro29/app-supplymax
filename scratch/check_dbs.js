const { execSync } = require('child_process');

function checkDb(path) {
    console.log(`--- Checking ${path} ---`);
    try {
        const output = execSync(`npx prisma db pull --print`, {
            env: { ...process.env, DATABASE_URL: `file:${path}` }
        }).toString();
        console.log(output);
    } catch (e) {
        console.log(`Error checking ${path}: ${e.message}`);
    }
}

checkDb('./dev.db');
checkDb('./prisma/dev.db');
