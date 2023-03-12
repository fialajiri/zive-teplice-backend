const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "jirka@codefactory.cz",
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailNode = async (to, subject, html) => {
  const mailOptions = {
    from: "jirka@codefactory.cz",
    to: to,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions);
};

const pass = 'lrA4a0D5@#0p'
