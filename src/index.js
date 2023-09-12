const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const http = require("http").createServer(app);

// Environmental variables(env) config
// If .env file is not found in location,
// no errors or exceptions will be thrown
console.log(process.env.NODE_ENV);
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Database
require("./database/mongoose");

// Bootstrap models
const models = path.join(__dirname, "models");
fs.readdirSync(models)
	.filter((file) => ~file.search(/^[^.].*\.js$/))
	.forEach((file) => require(path.join(models, file)));

// CORS
app.use(function (req, res, next) {
	//   var allowedDomains = process.env.ALLOWED_DOMAINS.split(" ");
	//   var origin = req.headers.origin;
	//   console.log(origin, allowedDomains, allowedDomains.indexOf(origin));
	//   if (allowedDomains.indexOf(origin) > -1) {
	// }
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Methods",
		" GET, POST, PATCH, PUT, DELETE, OPTIONS"
	);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	next();
});
app.use(express.json());

// Bootstrap routes
const { routes } = require("./routes");
// routes.websiteV1(app);
app.use(routes);

app.get("/", (req, res) => {
	res.send({ message: "🍑🍆💦" });
});

app.use("*", (req, res) => {
	res.status(404).send({ message: "Invalid API route!" });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log("Server running on port " + port);
});
