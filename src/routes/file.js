const multer = require("multer");
const { uploadFile, getFiles, downloadFile } = require("../controllers/file");
const auth = require("../middlewares/auth");

const router = require("express").Router();

const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

router.post("/upload", auth, upload.single("file"), uploadFile);
router.get("/", auth, getFiles);
router.get("/download/:id", auth, downloadFile);

module.exports = router;
