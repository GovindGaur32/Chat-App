const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");


var transporter = nodemailer.createTransport({
 service:'gmail', 
  auth: {
    user: `${process.env.EmailAddress}`,
    pass: `${process.env.appPass}`,
  },
});
console.log(`${process.env.EmailAddress},${process.env.appPass}`);

function sendEmail(email) { 
  const mailOptions = {
    from: `${process.env.EmailAddress}`,
    to: email,
    subject: "Welcome to Snappy",
    text: "Welcome to Snappy feel free to chat"          
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
function sendOtp(email,otp) { 
  const mailOptions = {
    from: `${process.env.EmailAddress}`,
    to: email,
    subject: "Otp to forgot password",
    text: `otp for forgot password is ${otp}  if you didn't do it Please check your password`
  };
  console.log(email,otp);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
module.exports.otp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ msg: "User not found", status: false });
    
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp;
    user.otpExpires = Date.now() + 300000; // 5 minutes expiration
    await user.save();
    
    await sendOtp(email, otp); // Ensure email sending is awaited
    return res.json({ status: true, otp });
  } catch (ex) {
    next(ex);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    sendEmail(email);
    delete user.password;
    return res.json({ status: true, user });
    
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
