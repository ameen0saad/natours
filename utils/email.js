const fs = require('fs');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ameen <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'pro.turbo-smtp.com',
        port: 587,
        auth: {
          user: process.env.TURBO_USERNAME,
          pass: process.env.TURBO_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
    };
    // 3) Create a transport and send email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const templateWelcome = fs.readFileSync(
      `${__dirname}/../view/Welcome.html`,
      'utf-8',
    );
    const html = templateWelcome
      .replace('{{firstName}}', this.firstName)
      .replace('{{welcomeURL}}', this.url);

    await this.send(html, 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    const templateReset = fs.readFileSync(
      `${__dirname}/../view/reset.html`,
      'utf-8',
    );

    const finalEmailBody = templateReset.replace(`{{resetURL}}`, this.url);
    await this.send(finalEmailBody, 'passwordReset');
  }
};

// const sendEmail = async (options) => {
//   // TODO : 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // TODO : 2) Define mail options
//   const mailOptions = {
//     from: 'Ameen Saad <ameen@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //html: `<a href ="http://127.0.0.1:3000api/v1/users/resetPassword19723b2892f67c4c67101b8e3835b3f6c843f6ddc33dec22ee15ab81391ba1bc"> reset`,
//   };
//   await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;
