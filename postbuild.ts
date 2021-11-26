/*
This file is used to quickly rename and compress the binaries built using pkg.  
It saves me about 30 seconds but took me 15 minutes to write, so this will pay off 31 versions from now.
*/

const exec = require('child_process').execSync;
const fs = require('fs-extra');
const pkg = require('./package.json');
const version = pkg.version;
const path = require('path');

// Empty the build directory
fs.emptyDir('./bin');

// Function to sort filters alphabetically
const sortFilter = (file: string) => {
    if (!fs.existsSync(file)) return console.log(`[${file}] File does not exist`);

    const $data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const $sorted = $data.sort((a: any, b: any) => a.localeCompare(b));

    fs.writeFileSync(file, JSON.stringify($sorted, null, 2));
    console.log(`[${file}] Sorted`);
};

// Sort both filters
sortFilter('./filters/main.json');
sortFilter('./filters/users.json');

// Data for target builds and file names
const files = [
    {
        target: 'subclean-linux',
        output: 'subclean',
        zipname: `subclean-${version}-linux.zip`
    },
    {
        target: 'subclean-macos',
        output: 'subclean',
        zipname: `subclean-${version}-macos.zip`
    },
    {
        target: 'subclean-win.exe',
        output: 'subclean.exe',
        zipname: `subclean-${version}-win.zip`
    }
];

// Build the binaries then compress them for github release
const compress = async () => {
    for (let file of files) {
        console.log(`[${file.target}] Processing`);

        await fs.copySync(file.target, file.output);
        console.log(`[${file.target}] Renamed file`);

        await exec(`tar.exe -a -c -f "bin/${file.zipname}" "${file.output}"`);
        console.log(`[${file.target}] Zipped`);

        await fs.unlinkSync(file.target);
        await fs.unlinkSync(file.output);
        console.log(`[${file.target}] Removed junk files`);
    }
};

// To avoid an error if we don't have the binaries
if (fs.existsSync(files[0].target)) compress();
