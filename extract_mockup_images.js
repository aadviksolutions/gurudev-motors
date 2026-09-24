const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'mockup_assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function extractImages(filePath, prefix) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)/g;
  let match;
  let index = 0;
  while ((match = regex.exec(content)) !== null) {
    let ext = match[1];
    if (ext === 'svg+xml') ext = 'svg';
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `${prefix}_img_${index}.${ext}`;
    const target = path.join(outDir, filename);
    fs.writeFileSync(target, buffer);
    console.log(`Saved ${target} (${buffer.length} bytes)`);
    index++;
  }
}

extractImages(path.join(__dirname, 'mockup_reference/Gurudev_Motors_WEBSITE_Sample_Mobile.html'), 'mobile');
extractImages(path.join(__dirname, 'mockup_reference/Gurudev_Motors_Premium_Fancy_V2.html'), 'v2');
