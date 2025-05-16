import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const mimetype = file.mimetype;

    // Handle audio uploads
    if (mimetype.startsWith("audio/")) {
      return {
        folder: "Quizz_Online/audio",
        resource_type: "video", // Cloudinary treats audio under 'video'
        format: "mp3" // optional, only use if you want to enforce format
      };
    }

    // Handle video uploads
    else if (mimetype.startsWith("video/")) {
      return {
        folder: "Quizz_Online/videos",
        resource_type: "video",
        transformation: [
          { width: 1280, height: 720, crop: "limit" }
        ]
      };
    }

    // Handle image uploads (default)
    else {
      return {
        folder: "Quizz_Online/images",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" }
        ]
      };
    }
  }
});


// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // fileFilter: (req, file, cb) => {
  //   console.log("File received:", file.mimetype);
  //   if (!file.mimetype.startsWith("audio/")) {
  //     return cb(new Error("Only audio files are allowed"), false);
  //   }
  //   cb(null, true);
  // }

});

export { cloudinary, upload };