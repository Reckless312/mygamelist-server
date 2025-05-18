const path = require("node:path");
const {Router} = require("express");
const {filesPayloadExists, fileSizeLimiter, fileExtLimiter, fileUpload} = require("../middleware")
const {readdir} = require("node:fs");
const fs = require("node:fs");
const router = Router();

router.post('/upload', fileUpload({createParentPath: true}), filesPayloadExists, fileExtLimiter(['.png', '.jpg', 'jpeg', '.mkv']), fileSizeLimiter, (req, res) => {
    const files = req.files;

    Object.keys(files).forEach(key => {
        const filepath = path.join(__dirname, '../uploadedFiles', files[key].name);
        files[key].mv(filepath, (err) => {
            if (err) return res.status(500).json({status: "error", message: err});
        });
    })

    return res.json({status: "success", message: Object.keys(files).toString()});
});

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'fileIndex.html'));
})

router.get('/files', (req, res) => {
    const fileDirectory = path.join(__dirname, '../uploadedFiles');

    readdir(fileDirectory, (_, fileDirectory) => {
        return res.json({status: "success", files: fileDirectory});
    })
});

router.get('/download', (req, res) => {
    const file = req.query;

    const filePath = path.join(__dirname, '../uploadedFiles', file.file);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    }
    else{
        res.status(404).json({ message: 'File not found!' });
    }
})

module.exports = router;