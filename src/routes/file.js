const multer = require("multer");
const { uploadFile, getFiles, downloadFile } = require("../controllers/file");

const router = require("express").Router();

const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/download/:id", downloadFile);

module.exports = router;
