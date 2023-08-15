const { abi } = require("./contractABI");
const { Verification } = require("./verification");

const config = {
  provider: process.env.PROVIDER,
  contract_addr: process.env.CONTRACT_ADDRESS,
  address: process.env.WALLET_ADDRESS,
  pvt_key: process.env.WALLET_PRIVATE_KEY,
};

const verifier = new Verification(config, abi);


module.exports = { verifier };
