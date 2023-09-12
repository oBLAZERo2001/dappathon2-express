const router = require("express").Router();
const user = require("./user");
const file = require("./file");
const token = require("./token");

router.use("/user", user);
router.use("/file", file);
router.use("/token", token);

module.exports = { routes: router };
