const multer = require('multer');
const path = require('path');

// ກຳນົດບ່ອນເກັບ ແລະ ຊື່ໄຟລ໌
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // ເກັບໃນ folder uploads
    },
    filename: (req, file, cb) => {
        // ຕັ້ງຊື່ໄຟລ໌ໃໝ່: ວັນທີ-ຊື່ໄຟລ໌ເດີມ
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// ກວດສອບປະເພດໄຟລ໌ (ອະນຸຍາດສະເພາະຮູບພາບ)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: ອະນຸຍາດສະເພາະຮູບພາບເທົ່ານັ້ນ!');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // ຈຳກັດ 2MB
    fileFilter: fileFilter
});

module.exports = upload;