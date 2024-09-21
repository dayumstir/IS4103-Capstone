import multer from "multer";

// Configure multer to handle image uploads
const storage = multer.memoryStorage(); // Store the file in memory as a buffer

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(file.originalname.toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
        return cb(null, true);
        } else {
        cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
        }
    },
});

export default upload;