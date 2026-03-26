const fs = require('fs');
try {
  const stats = fs.statSync('./public/logo4.png');
  console.log('Size of logo4.png:', stats.size, 'bytes');
} catch (e) {
  console.error(e);
}
