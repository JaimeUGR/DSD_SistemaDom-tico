
const database = require("./src/database.js")
const servidor = require("./src/servidor.js")
const agente = require("./src/agente.js")

async function start()
{
	console.log("<> Iniciando <>")

	await database.conectar()
	await servidor.start()
	await agente.start("http://localhost:8080")

	console.log("<> Inicio Completado <>")
}

async function stop(e)
{
	let err = e

	console.log("<> Terminando <>")

	await servidor.stop()
	await database.desconectar()

	console.log("<> Terminación Completada <>")

	if (err)
		process.exit(1)

	process.exit(0)
}

start()

process.once("SIGTERM", () => {
	console.log("Recibido SIGTERM")
	stop()
})

process.once('SIGINT', () => {
	console.log("Recibido SIGINT")
	stop()
})

process.once("uncaughtException", err => {
	console.log("Uncaught Excepcion")
	console.error(err)
	stop(err)
})
