const fs = require('fs');

function inspectFile(filename) {
  if (!fs.existsSync(filename)) return;
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== FILE:', filename, '===');
  console.log('Total characters:', content.length);
  
  // Clean large base64
  const cleaned = content.replace(/data:image\/[^;]+;base64,[^"'\s)]+/g, '[BASE64_IMAGE]');
  fs.writeFileSync(filename.replace('.html', '_cleaned.html'), cleaned);
  console.log('Saved cleaned version:', filename.replace('.html', '_cleaned.html'), 'Size:', cleaned.length);
  
  // Extract key sections
  const lines = cleaned.split('\n');
  console.log('Total lines:', lines.length);
}

inspectFile('mockup_reference/Gurudev_Motors_WEBSITE_Sample_Mobile.html');
inspectFile('mockup_reference/Gurudev_Motors_Premium_Fancy_V2.html');
inspectFile('mockup_reference/Gurudev_Motors_Premium_Website.html');
