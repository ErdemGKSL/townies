// if args includes alpha, beta, or rc, then it will bump the version
// and create a new tag
// if args includes release, then it will bump the version and create a new tag

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const isDev = args.includes('dev');

const packageJsonPath = path.resolve(process.cwd(), './package.json');
const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (isDev) {
    const version = (packageJsonContent.version.split('-')[0]) + "-dev." + Math.floor(Date.now() / (1000 * 60));
    packageJsonContent.version = version;
} else {
    const version = packageJsonContent.version.split("-")[0];

    const newVersion = semver.inc(version, 'patch');;
    packageJsonContent.version = newVersion;
}
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));