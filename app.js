require("dotenv").config()
require("express-async-errors")
const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")

const authRouter = require("./routes/authRoutes")
const userRouter = require("./routes/userRoutes")
const vaccineRouter=require("./routes/vaccineRoutes")
const {registerManufacturerValidation}=require("./middleware/validation")

const client = require("./config/database")

// middleware
const { authenticateUser } = require("./middleware/full-auth")
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

//Define Routes
app.use("/auth", authRouter)
app.use("/user", authenticateUser, userRouter)
app.use("/vaccine",authenticateUser,vaccineRouter)

// not found route and err handler
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

app.listen(process.env.PORT, function (err) {
	if (err) console.log("Error in server setup")
	client.connect(function (err) {
		if (err) {
			return console.error("could not connect to postgres", err)
		}
		console.log("DB connected")
	})
	console.log("Server listening on Port", process.env.PORT)
})
