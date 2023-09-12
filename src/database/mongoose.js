const mongoose = require("mongoose");
const url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/dappathon2";

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
	console.log("Connected to the Database.");
});
