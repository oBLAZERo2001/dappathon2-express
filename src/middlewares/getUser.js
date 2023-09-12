const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

async function getUser(req, _, next) {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findOne({
			_id: decoded._id,
			address: decoded.wallet_address,
			"tokens.nonce": decoded.nonce,
			"tokens.token": token,
		});
		req.user = user;
		next();
	} catch (e) {
		next();
	}
}

module.exports = getUser;
