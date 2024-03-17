const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,  
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_AUTH,
  }
})

exports.sendEmail = async (to, subject, html) => {
 await transporter.sendMail({
  from: process.env.EMAIL,
  to,
  subject,
  html
 })
}

// const transporter = nodemailer.createTransport(
//     sendgridTransport({
//       auth: {
//         api_key:
//           "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",
//       },
//     })
//   );

// exports.sendEmail = async (to, subject, html) => {

//   await transporter.sendMail({
//     from: "finc.dev@gmail.com",
//     to: to,
//     subject: subject,    
//     html: html,
//   });  
// };
