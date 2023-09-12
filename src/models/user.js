const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { OtpNonce } = require("./otpnonce");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			validate(value) {
				if (!validator.matches(value.toString(), "^[a-zA-Z0-9_.-]*$")) {
					throw new Error("username not valid");
				}
			},
		},
		displayName: {
			type: String,
			trim: true,
			required: true,
		},
		address: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("invalid address");
				}
			},
		},
		displayImage: {
			type: String,
			default:
				"https://spriyo.s3.ap-south-1.amazonaws.com/images/default-profile-icon.png",
			required: true,
		},
		phone: {
			type: Number,
			trim: true,
			validate(value) {
				if (!validator.isMobilePhone(value.toString())) {
					throw new Error("phone number is invalid");
				}
			},
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value.toString())) {
					throw new Error("email is invalid");
				}
			},
		},
		is_email_verified: {
			type: Boolean
		},
		disabled: {
			type: Boolean,
			required: true,
			default: false,
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					required: true,
					default: new Date(),
				},
				nonce: {
					type: Number,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

UserSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.tokens;

	return userObject;
};

// Instance methods
UserSchema.methods.generateToken = async function (nonce) {
	const user = this;

	const otpNonce = await OtpNonce.findOne({
		nonce,
		address: user.address,
		expireAt: { $gt: new Date() },
	});
	if (!otpNonce) throw new Error("Invalid or expired signature.");

	// Signing JWT
	const payload = {
		_id: user._id,
		wallet_address: user.address,
		nonce: otpNonce.nonce,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "1 days",
	});

	user.tokens = user.tokens.concat({ token, nonce });
	await user.save();

	// Delete OTPNonces if everyting passes
	await OtpNonce.deleteMany({ address: user.address });
	return token;
};

const User = new mongoose.model("User", UserSchema);
// // ADD's or DROP's unique indexes
// User.syncIndexes();

module.exports = { User };
