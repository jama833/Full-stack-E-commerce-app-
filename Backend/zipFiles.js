const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const backendDir = __dirname;
const zipPath = path.join(backendDir, 'backend.zip');

try {
  // Create a new ZIP file
  const zip = new AdmZip();

  // Add files
  zip.addFile('server.js', fs.readFileSync(path.join(backendDir, 'server.js')));
  zip.addFile('package.json', fs.readFileSync(path.join(backendDir, 'package.json')));
  zip.addFile('package-lock.json', fs.readFileSync(path.join(backendDir, 'package-lock.json')));
  zip.addFile('Procfile', fs.readFileSync(path.join(backendDir, 'Procfile')));

  // Add directories
  const addDirToZip = (dirPath, zipBasePath) => {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const zipPath = zipBasePath ? `${zipBasePath}/${file}` : file;
      
      if (fs.statSync(fullPath).isDirectory()) {
        addDirToZip(fullPath, zipPath);
      } else {
        zip.addFile(zipPath, fs.readFileSync(fullPath));
      }
    });
  };

  // Add images and node_modules directories
  addDirToZip(path.join(backendDir, 'images'), 'images');
  addDirToZip(path.join(backendDir, 'node_modules'), 'node_modules');

  // Write ZIP file
  zip.writeZip(zipPath);

  const stats = fs.statSync(zipPath);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`✓ Backend zipped successfully!`);
  console.log(`  File size: ${fileSizeMB} MB`);
  console.log(`  Location: ${zipPath}`);
} catch (error) {
  console.error('Error creating zip file:', error.message);
  process.exit(1);
}
