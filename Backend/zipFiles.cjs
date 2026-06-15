const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = __dirname;
const zipPath = path.join(backendDir, 'backend.zip');

const requiredFiles = ['package.json', 'package-lock.json', 'server.js'];
const optionalFiles = ['.env.example'];
const requiredDirs = ['images'];
const optionalDirs = ['.ebextensions'];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(backendDir, file))) {
    console.error(`Error: required file missing: ${file}`);
    process.exit(1);
  }
}

for (const dir of requiredDirs) {
  if (!fs.existsSync(path.join(backendDir, dir))) {
    console.error(`Error: required folder missing: ${dir}`);
    process.exit(1);
  }
}

try {
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  const entries = [
    ...requiredFiles,
    ...optionalFiles.filter((file) => fs.existsSync(path.join(backendDir, file))),
    ...requiredDirs,
    ...optionalDirs.filter((dir) => fs.existsSync(path.join(backendDir, dir))),
  ];

  execSync(`tar -a -c -f "${zipPath}" ${entries.join(' ')}`, {
    cwd: backendDir,
    stdio: 'inherit',
  });

  const stats = fs.statSync(zipPath);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log('\n✓ Backend zipped successfully!');
  console.log(`  File size: ${fileSizeMB} MB`);
  console.log(`  Location: ${zipPath}`);
  console.log(`  Contents: ${entries.join(', ')}`);
} catch (error) {
  console.error('Error creating zip file:', error.message);
  process.exit(1);
}
