const mongoose = require("mongoose");
const url = process.env.MONGODB_URL;

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
	mongoose.connection.db
		.collection("users")
		.createIndex({ email: 1 }, { sparse: true, unique: true });
	mongoose.connection.db
		.collection("users")
		.createIndex({ address: 1 }, { sparse: true, unique: true });
	console.log("Connected to the Database.");
});
