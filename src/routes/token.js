const { getTokens, addToken } = require("../controllers/token");

const router = require("express").Router();

router.post("/", addToken);
router.get("/", getTokens);

module.exports = router;
