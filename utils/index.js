const { createJWT, isTokenValid, createTempJWT } = require("./jwt");
const checkPermissions = require("./checkPermissions");
const sendVerificationEmail = require("./sendVerficationEmail");
const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const sendRegisterStaffEmail = require("./sendRegisterStaffEmail");
const createHash = require("./createHash");

module.exports = {
  createJWT,
  createTempJWT,
  createHash,
  isTokenValid,
  checkPermissions,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendRegisterStaffEmail,
};
