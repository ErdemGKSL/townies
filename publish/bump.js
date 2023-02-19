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
const isRc = args.includes('rc');

const packageJsonPath = path.resolve(process.cwd(), './package.json');

// read the package.json file
const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// get the current version
const currentVersion = packageJsonContent.version;

// bump the version
const newVersion = semver.inc(currentVersion, isRelease ? 'patch' : 'prerelease', isAlpha ? 'alpha' : isBeta ? 'beta' : 'rc');

// update the version in the package.json file
packageJsonContent.version = newVersion;

// write the package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));


