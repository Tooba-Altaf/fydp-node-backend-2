const { PrismaClient, UserType, UserStatus } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const createCivilianVaccineRecord=async(req,res)=>{
    //have to add condition that only received vaccines can be entered in civilian record
const {cnic,name,gender,contact,date_of_birth,dispatch_id}=req.body;
 let civilian;
civilian=await prisma.civilian.findUnique({
    where:{
        cnic:cnic
    } ,
    select:{
        cnic:true,
       id:true,

    }
})
if (!civilian){
civilian=await prisma.civilian.create({
    data:{
      cnic:cnic,
      name:name,
      gender:gender,
      contact:contact ,
      date_of_birth:date_of_birth,
    },
    select:{
        cnic:true,
        id:true,
    }
})}
if (civilian){
    const updateDispatch=await prisma.dispatch.update({
        where:{
            id:dispatch_id
        },
        data:{
            civilian_id:civilian.id 
           },
        select:{
            id:true,
            vaccine_id:true,
            batch_id:true,
            civilian_id:true
        }
    })
    res.status(StatusCodes.OK).send({ data: updateDispatch });
}
else {
    throw new CustomError.CustomAPIError("Something went wrong");
  }
}

const getCivilian=async(req,res)=>{
    const {cnic}=req.body;
    const civilianRecord=await prisma.civilian.findUnique({
        where:{
            cnic:cnic
        },select:{
            id:true,
        }
    })
    if (!civilianRecord) {
        throw new CustomError.NotFoundError("invalid request");
      }
    const dispatchRecord=await prisma.dispatch.findMany({
        where:{
            civilian_id:civilianRecord.id},
        // ,select:{
        //     id:true,
        //     batch_id:true,
        //     vaccine_id:true,
        //     civilian_id:true,}
            include:{vaccine:true}
        
    })
    res.status(StatusCodes.OK).send({ data: dispatchRecord });


}
module.exports={
createCivilianVaccineRecord,
getCivilian
}