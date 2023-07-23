const { sign, verify } = require("jsonwebtoken");

const createJWT = (payload) => {
  const token = sign(payload, process.env.JWT_SECRET);
  return token;
};

const createTempJWT = (payload) => {
  // Set the expiration time to 5 min from the current time
  const expirationTime = Math.floor(Date.now() / 1000) + 300; // 300 seconds = 5 min
  payload = { ...payload, exp: expirationTime };

  const token = sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => verify(token, process.env.JWT_SECRET);

module.exports = {
  createJWT,
  createTempJWT,
  isTokenValid,
};
