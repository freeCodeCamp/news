const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const md5 = require('md5');
const { parse, normalize } = require('path');
let manifest = {};

function cacheBusterShortcode(filePath) {
  // Handle cases where filePath doesn't start with /
  filePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const { dir, base, name, ext } = parse(filePath);
  const localFilePath = `./src/_includes${filePath}`;

  if (!manifest[base]) {
    // Create the final directory if it doesn't already exist
    const finalBasePath = `./dist${dir}`;
    mkdirSync(finalBasePath, { recursive: true });

    // Generate 10 char MD5 hash of file content
    // of original filenames --> hashed equivalents
    const content = readFileSync(localFilePath);
    const hash = md5(content).slice(0, 10);
    const hashedFilename = `${name}-${hash}${ext}`;

    // Write hashed version of file and save to manifest
    writeFileSync(`${finalBasePath}/${hashedFilename}`, content);
    manifest[base] = hashedFilename;
  }

  const hashedRelativeUrl = `${filePath.replace(base, manifest[base])}`;

  // Return final path with hashed filename to the template
  return normalize(hashedRelativeUrl);
}

module.exports = cacheBusterShortcode;
