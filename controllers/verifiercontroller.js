const { StatusCodes } = require("http-status-codes");

const { verifier } = require("../blockchain/verificationInstance");
const CustomError = require("../errors");


const createhash = async (req, res) => {
  const {
    data
  } = req.body;

 
    try {
      const txHash = await verifier.uploadHash(
        data,
        process.env.WALLET_ADDRESS
      );

      
    } catch (error) {
      throw new CustomError.CustomAPIError(error);
    }

    res.status(StatusCodes.OK).send({ message: "success" });
  } 



const verifyhash = async (req, res) => {
  const { data } = req.body;


    try {
      await verifier.verifyHash(data);
      res.status(StatusCodes.OK).send({ message: "Record is Verified" });
    } catch (error) {
      res.status(StatusCodes.OK).send({ message: "Record is not Verified" });
    
  }
};


module.exports = {
  verifyhash,
  createhash
};
