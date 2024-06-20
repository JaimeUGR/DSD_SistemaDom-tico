
const io = require("socket.io-client")

const TIPO_ACTUADORES = {
	aire: "Aire Acondicionado",
	calefaccion: "Calefacción",
	persiana: "Persiana",
	humidificador: "Humidificador"
}

const TIPO_SENSORES = {
	temperatura: "Temperatura",
	luz: "Luz",
	humedad: "Humedad"
}

async function start(url)
{
	const socket = io(url, {
		query: { tipo: "agente" },
	})

	const sio = socket.connect()

	function cambiarEstadoActuadores(actuadores, tipoActuador, nuevoEstado)
	{
		actuadores
			.filter(actuador => actuador.tipoActuador === tipoActuador)
			.map(actuador => sio.emit("cliente_cambiar-actuador", {
				idActuador: actuador._id,
				estadoActuador: nuevoEstado
			}))
	}

	sio.on("agente_medir-sensor", (habitacion) => {
		const limitesMedidas = habitacion.limitesMedidas
		const infoSensor = habitacion.sensorActivado
		const actuadores = habitacion.actuadores

		// Realizar los ajustes necesarios
		switch (infoSensor.tipoSensor)
		{
			case TIPO_SENSORES.temperatura:
			{
				// Superior a la temperatura máxima
				if (limitesMedidas.maxTemperatura !== null && limitesMedidas.maxTemperatura < infoSensor.ultimaMedida)
				{
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.calefaccion, "OFF")
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.aire, "ON")
				}

				// Inferior a la temperatura mínima
				if (limitesMedidas.minTemperatura !== null && limitesMedidas.minTemperatura > infoSensor.ultimaMedida)
				{
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.calefaccion, "ON")
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.aire, "OFF")
				}

				break
			}
			case TIPO_SENSORES.luz:
			{
				// Superior a la luz máxima
				if (limitesMedidas.maxLuz !== null && limitesMedidas.maxLuz < infoSensor.ultimaMedida)
				{
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.persiana, "OFF")
				}

				// Inferior a la luz mínima
				if (limitesMedidas.minLuz !== null && limitesMedidas.minLuz > infoSensor.ultimaMedida)
				{
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.persiana, "ON")
				}

				break
			}
			case TIPO_SENSORES.humedad:
			{
				// Superior a la humedad máxima
				if (limitesMedidas.maxHumedad !== null && limitesMedidas.maxHumedad < infoSensor.ultimaMedida)
				{
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.humidificador, "OFF")
				}

				// Inferior a la humedad mínima
				if (limitesMedidas.minHumedad !== null && limitesMedidas.minHumedad > infoSensor.ultimaMedida)
				{
					cambiarEstadoActuadores(actuadores, TIPO_ACTUADORES.humidificador, "ON")
				}

				break
			}
		}
	})
}

module.exports = { start }
