const { PrismaClient, UserType, UserStatus } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const prisma = new PrismaClient();

const createCivilianVaccineRecord=async(req,res)=>{
const {cnic,name,gender,contact,date_of_birth,dispatch}=req.body;
const civilian=await prisma.civilian.update({
    where:{
        cnic:cnic
    } ,
    data:{
        dispatch:{
            create:dispatch,
        }
    },
    select:{
        cnic:true,
        name:true,
        gender:true,
        contact:true,
        date_of_birth:true,
        dispatch:true

    }
})
res.status(StatusCodes.OK).send({ data: civilian });
if (!civilian){
const newCivilian=await prisma.civilian.create({
    data:{
      cnic:cnic,
      name:name,
      gender:gender,
      contact:contact ,
      date_of_birth:date_of_birth,
      dispatch:{create:dispatch}
    },
    select:{
        cnic:true,
        name:true,
        gender:true,
        contact:true,
        date_of_birth:true,
        dispatch:true

    }
})

res.status(StatusCodes.OK).send({ data: newCivilian });
if (civilian||newCivilian){
    const updateDispatch=await prisma.dispatch.update({
        where:{
            id:civilian.dispatch.id || newCivilian.dispatch.id
        },
        data:{
            civilian_id:civilian.id || newCivilian.civilian.id
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
}else {
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
            name:true,
            date_of_birth:true,
            dispatch:true
        }
    })
    res.status(StatusCodes.OK).send({ data: civilianRecord });

}
module.exports={
createCivilianVaccineRecord,
getCivilian
}