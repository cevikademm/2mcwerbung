const fs = require('fs');
const https = require('https');

const url = "https://smxadfujomneusxclqbu.supabase.co/storage/v1/object/public/resim%20logo/logo4.png";
const dest = "./public/logo4.png";

https.get(url, (res) => {
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Download completed");
  });
}).on('error', (err) => {
  console.error("Error: ", err.message);
});
