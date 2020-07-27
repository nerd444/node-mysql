const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (options) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWD,
    },
  });

  // send mail with defined transport object
  let message = {
    from: `${process.env.FROM_NAME} <${process.env.FRON_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(message);
  console.log("이메일로 메세지 보냄 : ", info.messageId);
};

module.exports = sendEmail;
