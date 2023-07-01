let pg = require("pg")

const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })

var client = new pg.Client(process.env.DB_CONFIG_URL)

module.exports = client
