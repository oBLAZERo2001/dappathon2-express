const { getTokens, addToken } = require("../controllers/token");
const auth = require("../middlewares/auth");

const router = require("express").Router();

router.post("/", auth, addToken);
router.get("/", auth, getTokens);

module.exports = router;
