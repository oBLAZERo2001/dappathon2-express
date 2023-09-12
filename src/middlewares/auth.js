const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findOne({
			_id: decoded._id,
			address: decoded.wallet_address,
			"tokens.nonce": decoded.nonce,
			"tokens.token": token,
		});

		if (!user) {
			throw new Error();
		}
		req.user = user;
		next();
	} catch (e) {
		res
			.status(404)
			.send({ message: "Please authenticate", systemError: e.message });
	}
}

module.exports = auth;
