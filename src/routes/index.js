const router = require("express").Router();
const user = require("./user");
const file = require("./file");
const token = require("./token");
const crypter = require("./crypter");

router.use("/user", user);
router.use("/file", file);
router.use("/token", token);
router.use("/cryptr", crypter);

module.exports = { routes: router };
