const multer = require("multer");
const { uploadFile, getFiles } = require("../controllers/file");

const router = require("express").Router();

const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);

module.exports = router;
