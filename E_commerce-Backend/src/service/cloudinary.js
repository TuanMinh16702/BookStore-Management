const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: 'dsaqn38ky',
  api_key: '837182636239378',
  api_secret: '5jvB0Hkf-PEexwwGHIx2iANJE2M'
});


class CloudinaryService {
  uploadFile(file) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
  
       streamifier.createReadStream(file.buffer).pipe(uploadStream);
     });
   }
  
  async uploadImages(files) {
    const uploadPromises = files.map(file => this.uploadFile(file));
    const results = await Promise.all(uploadPromises);
  
    const paths = results.map(item => item.secure_url);
  
    return { paths };
  }
}

module.exports = new CloudinaryService();
