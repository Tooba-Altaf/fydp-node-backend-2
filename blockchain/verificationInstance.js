const { abi } = require("./contractABI");
const { Verification } = require("./verification");

const config = {
  provider: process.env.PROVIDER,
  contract_addr: process.env.CONTRACT_ADDRESS,
  address: process.env.WALLET_ADDRESS,
  pvt_key: process.env.WALLET_PRIVATE_KEY,
};

const verifier = new Verification(config, abi);

// Usage
const dataRow = ["data1", "data2", "data3"];

// verifier
//   .uploadHash(dataRow, process.env.WALLET_ADDRESS)
//   .then((txHash) => {
//     console.log("Transaction Hash:", txHash);
//   })
//   .catch((error) => {
//     console.log("thisis err", error);
//   });

// verifier
//   .verifyHash(dataRow)
//   .then((isVerified) => {
//     console.log("Is Hash Verified:", isVerified);
//   })
//   .catch((error) => {
//     console.log("thisis err", error);
//   });

module.exports = { verifier };
