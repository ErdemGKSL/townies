// if args includes alpha, beta, or rc, then it will bump the version
// and create a new tag
// if args includes release, then it will bump the version and create a new tag

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const isRelease = args.includes('release');
const isAlpha = args.includes('alpha');
const isBeta = args.includes('beta');
const isDev = args.includes('dev');

const packageJsonPath = path.resolve(process.cwd(), './package.json');

// read the package.json file
const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// get the current version


// determine the type of bump
const releaseType = isRelease ? 'patch' : 'prerelease';
const publishType = isAlpha ? 'alpha' : isBeta ? 'beta' : isDev ? "dev" : null;

let currentVersion;
try { currentVersion = fs.readFileSync(path.resolve(process.cwd(), `./publish/version.txt`), "utf-8"); } catch { currentVersion = "0.0.0"; }
try { if (publishType) currentVersion += "-" + fs.readFileSync(path.resolve(process.cwd(), `./publish/${publishType ?? "release"}.txt`), "utf-8"); } catch { if (publishType) currentVersion += `-${publishType}.0`; }

// bump the version
let newVersion = (packageJsonContent.version.includes("-") && !publishType) ? currentVersion : (
    semver.inc((publishType ? currentVersion : currentVersion.split("-")[0]), releaseType, publishType ?? "null")
);

if (newVersion.includes("-null")) newVersion = newVersion.split("-")[0];

// write the new version to the file
fs.writeFileSync(path.resolve(process.cwd(), `./publish/version.txt`), newVersion.split('-')[0]);
if (newVersion.split('-')[1]) fs.writeFileSync(path.resolve(process.cwd(), `./publish/${publishType}.txt`), newVersion.split('-')[1]);
else {
    ["alpha", "beta", "rc", "dev"].forEach(type => {
        try {
            fs.unlinkSync(path.resolve(process.cwd(), `./publish/${type}.txt`));
        } catch {}
    });
}

// update the version in the package.json file
packageJsonContent.version = newVersion;

// write the package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));