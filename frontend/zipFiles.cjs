const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const frontendDir = __dirname;
const distDir = path.join(frontendDir, 'dist');
const zipPath = path.join(frontendDir, 'frontend.zip');

try {
  // Remove existing zip file if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Check if dist folder exists
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Create a new ZIP file
  const zip = new AdmZip();

  // Add package.json and entry point files for Elastic Beanstalk
  zip.addFile('package.json', fs.readFileSync(path.join(frontendDir, 'package.json')));
  zip.addFile('server.cjs', fs.readFileSync(path.join(frontendDir, 'server.cjs')));
  zip.addFile('Procfile', fs.readFileSync(path.join(frontendDir, 'Procfile')));

  // Add dist folder recursively
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

  // Add dist directory contents
  addDirToZip(distDir, 'dist');

  // Add .ebextensions folder for Elastic Beanstalk configuration
  const ebextDir = path.join(frontendDir, '.ebextensions');
  if (fs.existsSync(ebextDir)) {
    addDirToZip(ebextDir, '.ebextensions');
  }

  // Write ZIP file
  zip.writeZip(zipPath);

  const stats = fs.statSync(zipPath);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`✓ Frontend zipped successfully!`);
  console.log(`  File size: ${fileSizeMB} MB`);
  console.log(`  Location: ${zipPath}`);
  console.log(`  Contents: server.js, Procfile, package.json + dist/ folder`);
} catch (error) {
  console.error('Error creating zip file:', error.message);
  process.exit(1);
}
