const { OtpNonce } = require("../models/otpnonce");
const { User } = require("../models/user");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");

async function signin(req, res) {
  try {
    const { sign, nonce } = req.body;
    console.log(sign, nonce);
    const recoveredAddress = recoverPersonalSignature({
      data: "Please approve this message \n \nNonce:\n" + nonce,
      signature: sign,
    });

    let user = await User.findOne({ address: recoveredAddress });
    let token;
    if (!user) {
      user = new User(req.body);
      user.address = recoveredAddress;
      if (!user.username) {
        user.username = user.address;
      }
    }
    token = await user.generateToken(nonce);

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function getUser(req, res) {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function generateNonce(req, res) {
  try {
    const { address } = req.body;
    if (!address) throw new Error("Bad request");

    // 10 min = 10min * 60sec * 1000milliseconds
    const nonce = Math.floor(Math.random() * 10000000);
    const expireAt = Date.now() + 10 * 60 * 1000;

    const otpNonce = new OtpNonce({ nonce, address, expireAt });
    await otpNonce.save();
    res.send({ nonce });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
}

module.exports = { signin, getUser, generateNonce };
