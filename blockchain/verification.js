const { ethers } = require("ethers");
const { SHA256 } = require("crypto-js");

class Verification {
  constructor(config, abi) {
    this.config = config;
    this.contractAddr = this.config.contract_addr;
    this.address = this.config.address;
    this.pvtKey = this.config.pvt_key;

    this.provider = new ethers.providers.JsonRpcProvider(this.config.provider);
    this.signer = new ethers.Wallet(this.pvtKey, this.provider);
    this.contract = new ethers.Contract(this.contractAddr, abi, this.signer);

    this.tx = {
      from: this.address,
      to: this.contractAddr,
      gasLimit: ethers.utils.hexlify(250000),
      gasPrice: ethers.utils.hexlify(ethers.utils.parseUnits("10", "gwei")),
      chainId: 80001,
    };
  }

  __generateHash(row) {
    let data = "";
    for (const r of row) {
      data += r;
    }

    return SHA256(data).toString();
  }

  async uploadHash(row, address) {
    const digest = this.__generateHash(row);
    address = ethers.utils.getAddress(address);

    const data = this.contract.interface.encodeFunctionData("uploadHash", [
      `0x${digest}`,
      Math.floor(Date.now() / 1000),
      address,
    ]);

    const nonce = await this.provider.getTransactionCount(this.address);
    this.tx.nonce = ethers.utils.hexlify(nonce);
    this.tx.data = data;

    const signedTx = await this.signer.signTransaction(this.tx);
    const txResponse = await this.provider.sendTransaction(signedTx);
    await txResponse.wait();

    return txResponse.hash;
  }

  async verifyHash(row) {
    const digest = this.__generateHash(row);
    return this.contract.verify(`0x${digest}`);
  }
}

module.exports = { Verification }