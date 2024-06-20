const database = require("./database.js")

const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const path = require("path")
const {ObjectId} = require("mongodb");

const app = express()
const server = http.createServer(app)
const sio = socketIO(server)
const port = process.env.PORT || 8080

async function start()
{
	app.use(express.static("public"))

	//
	// Rutas
	//

	app.get("/", (req, res) => {
		res.sendFile(path.join(__dirname, "../public/html/cliente.html"))
	})

	//
	// Base de datos
	//
	let dbo = database.obtenerConexion()
	await crearColecciones(dbo)

	//
	let colecHabitaciones = await dbo.collection("Habitaciones")
	let colecSensores = await dbo.collection("Sensores")
	let colecActuadores = await dbo.collection("Actuadores")
	let colecHistorial = await dbo.collection("Historial")

	//
	const PIPELINE_INFO_HABITACIONES = [
		{
			$lookup: {
				from: "Sensores",
				localField: "_id",
				foreignField: "nombreHabitacion",
				as: "sensores"
			}
		},
		{
			$lookup: {
				from: "Actuadores",
				localField: "_id",
				foreignField: "nombreHabitacion",
				as: "actuadores"
			}
		},
		{
			$project: {
				_id: 0,
				nombre: "$_id",
				sensores: "$sensores",
				actuadores: "$actuadores"
			}
		}
	]

	//
	// Websocket
	//
	let infoSesiones = {
		clientes: 0,
		agentes: 0
	}

	let numSesiones = 0

	sio.sockets.on("connection", (client) => {
		const tipoCliente = client.handshake.query.tipo

		console.log("Se conecta un cliente de tipo " + tipoCliente)

		//
		// Si es un agente, el procesamiento es especial
		//

		if (tipoCliente === "agente")
		{
			infoSesiones.agentes++

			sio.sockets.emit("cambio-sesiones", infoSesiones)

			client.on("disconnect", () => {
				console.log("Se desconecta un agente")
				infoSesiones.agentes--
				sio.sockets.emit("cambio-sesiones", infoSesiones)
			})

			// TODO: Aquí se podría crear un evento diferente para no repetir nada
			client.on("cliente_cambiar-actuador", (infoActuador) => {
				console.log("Se cambia el estado de un actuador: " + infoActuador.idActuador)

				const OIdActuador = new ObjectId(infoActuador.idActuador)

				colecActuadores.findOne({ _id: OIdActuador }).then((actuador) => {
					if (!actuador || actuador.estadoActuador === infoActuador.estadoActuador)
						return

					// Actualizar el valor del estado
					colecActuadores.updateOne({ _id: OIdActuador }, { $set: { estadoActuador: infoActuador.estadoActuador
						}}).then((result) => {
						infoActuador.nombreHabitacion = actuador.nombreHabitacion
						infoActuador.tipoActuador = actuador.tipoActuador

						let log = `El actuador [${actuador._id}] cambia su estado a ${infoActuador.estadoActuador}.`
						let timestamp = new Date()

						colecHistorial.insertOne({
							log: log,
							timestamp: timestamp
						}).then(() => {
							sio.sockets.emit("log", `[${timestamp.toLocaleDateString()} - ${timestamp.toLocaleTimeString()}] ${log}`)
						}).catch((err) => {
							console.error(err)
						})

						// Notificar el cambio
						sio.sockets.emit("cambiar-actuador", infoActuador)

					}).catch((err) => {
						console.error(err)
					})

				}).catch((err) => {
					console.error(err)
				})
			})

			return
		}

		//
		// Inicialización
		//
		infoSesiones.clientes++

		//
		// Emisión de eventos iniciales
		//

		sio.sockets.emit("cambio-sesiones", infoSesiones)

		colecHabitaciones.aggregate(PIPELINE_INFO_HABITACIONES).toArray().then((result) => {
			sio.sockets.emit("init-habitaciones", result)
		}).catch((err) => {
			console.error(err)
		})

		//
		// Suscripción a los eventos
		//
		client.on("disconnect", () => {
			console.log("Se desconecta un cliente")
			infoSesiones.clientes--
			sio.sockets.emit("cambio-sesiones", infoSesiones)
		})

		//
		// Creación
		//

		client.on("cliente_crear-habitacion", (habitacion) => {

			if (habitacion.nombre === "" || habitacion.nombre === undefined)
				return

			colecHabitaciones.insertOne({
				_id: habitacion.nombre, // NOTE: se usará como campo id porque no queremos repetidas
				limitesMedidas: habitacion.limitesMedidas
			}).then(() => {
				sio.sockets.emit("nueva-habitacion", habitacion)
			}).catch((err) => {
				console.error(err)
			})
		})

		client.on("cliente_crear-actuador", (infoActuador) => {
			console.log("Un cliente crea un actuador")
			console.log(infoActuador)

			colecActuadores.insertOne({
				nombreHabitacion: infoActuador.nombreHabitacion,
				tipoActuador: infoActuador.tipoActuador,
				estadoActuador: "OFF"
			}).then((result) => {
				infoActuador.idActuador = result.insertedId.toString()
				infoActuador.estadoActuador = "OFF"
				sio.sockets.emit("nuevo-actuador", infoActuador)
			}).catch((err) => {
				console.error(err)
			})
		})

		client.on("cliente_crear-sensor", (infoSensor) => {
			console.log("Un cliente crea un sensor")
			console.log(infoSensor)

			colecSensores.insertOne({
				nombreHabitacion: infoSensor.nombreHabitacion,
				tipoSensor: infoSensor.tipoSensor,
				ultimaMedida: null
			}).then((result) => {
				infoSensor.idSensor = result.insertedId.toString()
				sio.sockets.emit("nuevo-sensor", infoSensor)
			}).catch((err) => {
				console.error(err)
			})
		})

		//
		// Actualización
		//

		client.on("medir-sensor", (infoSensor) => {
			console.log("Un sensor realiza una medida")

			// TODO: Actualizar su última medida
			console.log(infoSensor)

			// Obtenemos la información en la BD del sensor
			const OIdSensor = new ObjectId(infoSensor.idSensor)

			colecSensores.findOne({ _id: OIdSensor }).then((sensor) => {
				if (!sensor)
					return

				// Actualizar el valor de la última medida
				colecSensores.updateOne({ _id: OIdSensor }, { $set: { ultimaMedida: infoSensor.medida}
				}).then((result) => {
					sensor.ultimaMedida = infoSensor.medida

					// Hacer el log
					let log = `El sensor [${infoSensor.idSensor}] ha medido ${infoSensor.medida} unidades`
					let timestamp = new Date()

					colecHistorial.insertOne({
						log: log,
						timestamp: timestamp
					}).then(() => {
						sio.sockets.emit("log", `[${timestamp.toLocaleDateString()} - ${timestamp.toLocaleTimeString()}] ${log}`)
					}).catch((err) => {
						console.error(err)
					})

					// Enviar la información a los agentes (NOTE: esto es algo caro pero no queremos acoplar
					// a los agentes con la BD. Además, en un sistema para la domótica de una casa, así que no
					// será enorme).
					const PIPELINE_INFO_HAB = [
						{
							$match: {
								_id: sensor.nombreHabitacion
							}
						},
						{
							$lookup: {
								from: "Sensores",
								localField: "_id",
								foreignField: "nombreHabitacion",
								as: "sensores"
							}
						},
						{
							$lookup: {
								from: "Actuadores",
								localField: "_id",
								foreignField: "nombreHabitacion",
								as: "actuadores"
							}
						},
						{
							$project: {
								_id: 0,
								nombre: "$_id",
								limitesMedidas: 1,
								sensores: "$sensores",
								actuadores: "$actuadores"
							}
						}
					]

					colecHabitaciones.aggregate(PIPELINE_INFO_HAB).toArray().then((result) => {
						if (!result || result.length === 0)
							return

						result = result[0]
						result.sensorActivado = sensor

						sio.sockets.emit("agente_medir-sensor", result)
					}).catch((err) => {
						console.error(err)
					})
				}).catch((err) => {
					console.error(err)
				})
			}).catch((err) => {
				console.error(err)
			})
		})

		client.on("cliente_cambiar-actuador", (infoActuador) => {
			console.log("Se cambia el estado de un actuador: " + infoActuador.idActuador)

			const OIdActuador = new ObjectId(infoActuador.idActuador)

			colecActuadores.findOne({ _id: OIdActuador }).then((actuador) => {
				if (!actuador || actuador.estadoActuador === infoActuador.estadoActuador)
					return

				// Actualizar el valor del estado
				colecActuadores.updateOne({ _id: OIdActuador }, { $set: { estadoActuador: infoActuador.estadoActuador
				}}).then((result) => {
					infoActuador.nombreHabitacion = actuador.nombreHabitacion
					infoActuador.tipoActuador = actuador.tipoActuador

					let log = `El actuador [${actuador._id}] cambia su estado a ${infoActuador.estadoActuador}.`
					let timestamp = new Date()

					colecHistorial.insertOne({
						log: log,
						timestamp: timestamp
					}).then(() => {
						sio.sockets.emit("log", `[${timestamp.toLocaleDateString()} - ${timestamp.toLocaleTimeString()}] ${log}`)
					}).catch((err) => {
						console.error(err)
					})

					// Notificar el cambio
					sio.sockets.emit("cambiar-actuador", infoActuador)

				}).catch((err) => {
					console.error(err)
				})

			}).catch((err) => {
				console.error(err)
			})
		})

		//
		// Destrucción
		//
		client.on("cliente_eliminar-habitacion", (nombreHabitacion) => {
			colecHabitaciones.deleteOne({ _id: nombreHabitacion }).then((result) => {

				// Borrar los actuadores
				colecActuadores.deleteMany({nombreHabitacion: nombreHabitacion}).then((result) => {

				}).catch((err) => {
					console.error(err)
				})

				// Borrar los sensores
				colecSensores.deleteMany({nombreHabitacion: nombreHabitacion}).then((result) => {

				}).catch((err) => {
					console.error(err)
				})

				sio.emit("eliminar-habitacion", nombreHabitacion)
			}).catch((err) => {
				console.error(err)
			})
		})

		client.on("cliente_eliminar-actuador", (idActuador) => {
			colecActuadores.deleteOne({ _id: new ObjectId(idActuador)}).then((result) => {
				sio.emit("eliminar-actuador", idActuador)
			}).catch((err) => {
				console.error(err)
			})
		})

		client.on("cliente_eliminar-sensor", (idSensor) => {
			colecSensores.deleteOne({ _id: new ObjectId(idSensor)}).then((result) => {
				sio.emit("eliminar-sensor", idSensor)
			}).catch((err) => {
				console.error(err)
			})
		})
	})

	//

	// Iniciar el servidor
	server.listen(port, () => console.log("Servidor Web Iniciado: http://localhost" + port))
}

async function crearColeccion(dbo, nombreColeccion)
{
	try
	{
		await dbo.createCollection(nombreColeccion)
	}
	catch(err)
	{
		console.log("HandledErr durante creación de colección: " + err)
	}
}

async function crearColecciones(dbo)
{
	await crearColeccion(dbo, "Habitaciones")
	await crearColeccion(dbo, "Actuadores")
	await crearColeccion(dbo, "Sensores")
	await crearColeccion(dbo, "Historial")
}

async function stop()
{
	await server.close((err) => {
		if (err)
			console.error(err)

		console.log("Servidor Web Cerrado")
	})
}

module.exports = { start, stop }
