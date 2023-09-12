const mongoose = require("mongoose");

const countSchema = new mongoose.Schema(
	{
		uplodes: {
			type: Number,
			default: 0,
			// required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Counter = new mongoose.model("Counter", countSchema);
module.exports = { Counter };
