const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const fileName = file?.originalname?.replace(/\s/g, "_");
        cb(null, `${Date.now()}_${fileName}`);
    },
});

var fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(pdf|jpg|JPEG|png|jpeg)$/)) {
        return callback(new Error('Invalid file format'), false)
    }
    callback(null, true)
}

const fileUpload = (fieldName) => (req, res, next) => {
    console.log(`[Multer] Processing upload for field: ${fieldName}`);
    multer({
        storage,
        fileFilter: fileFilter,
    }).single(fieldName)(req, res, (err) => {
        if (err) {
            console.log(`[Multer] Error: ${err.message}`);
            return res.status(400).json({ error: err.message });
        }
        if (req.file) {
            console.log("Uploaded File:");
            console.log(`- ${req.file.originalname} -> ${req.file.filename}`);
            console.log(`- Size: ${req.file.size} bytes`);
            console.log(`- Full path: ${req.file.path}`);
        } else {
            console.log(`[Multer] No file uploaded for field: ${fieldName}`);
        }
        next();
    });
};

module.exports = fileUpload