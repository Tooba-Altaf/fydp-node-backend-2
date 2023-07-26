const sendEmail = require("./sendEmail");

const sendRegisterStaffEmail = async ({ name, email, token, origin }) => {
  const resetURL = `${origin}/reset-password?token=${token}`;
  const message = `<p>Please set your password by clicking on the following link : 
  <a href="${resetURL}">set Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Welcome to ShotCheck",
    html: `<h4>Hello, ${name}</h4>
   ${message}
   `,
  });
};

module.exports = sendRegisterStaffEmail;
