
const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017"
const dbName = "DSD_SistemaDomotico"

let client
let db

async function conectar()
{
	try
	{
		client = await MongoClient.connect(url, { useUnifiedTopology: true })
		console.log("Conexión establecida con MongoDB")
		db = client.db(dbName)
	}
	catch (error)
	{
		console.error("Error al conectar a MongoDB", error)
	}
}

function obtenerConexion()
{
	return db
}

async function desconectar()
{
	try
	{
		await client.close()
		console.log("Conexión con MongoDB cerrada")
	}
	catch (error)
	{
		console.error("Error al cerrar la conexión con MongoDB", error)
	}
}

module.exports = { conectar, obtenerConexion, desconectar }
