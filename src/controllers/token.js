const { Token } = require("../models/token");

const addToken = async (req, res) => {
	try {
		const { address, name } = req.body;
		console.log("in add token", "address", address);
		console.log(req.user);
		if (!address) return res.status(400).json({ error: "required address" });
		if (!name) return res.status(400).json({ error: "required name" });

		const token = Token.create({
			address,
			name,
			user_id: req.user._id,
		});

		return res.status(200).json(token);
	} catch (error) {
		console.error("Error adding token", error);
		res.status(500).json({ error: "Error adding token", e: error });
	}
};
const getTokens = async (req, res) => {
	try {
		const tokens = await Token.find({
			user_id: req.user._id,
		});

		res.status(200).json({ tokens });
	} catch (error) {
		console.error("Can't get token", error);
		res.status(500).json({ error: "Can't get token", e: error });
	}
};

module.exports = { addToken, getTokens };
