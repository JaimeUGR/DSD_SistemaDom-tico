
const TIPO_ACTUADORES = ["Aire Acondicionado", "Calefacción", "Persiana", "Humidificador"]
const TIPO_SENSORES = ["Temperatura", "Luz", "Humedad"]

const elementoInfoUsuarios = document.getElementById("info-usuarios")
const elementoInfoAgentes = document.getElementById("info-agentes")

const divLogs = document.getElementById("logs")

//
// Funciones
//

function actualizarSesiones(infoSesiones)
{
	elementoInfoUsuarios.textContent = `Usuarios conectados: ${infoSesiones.clientes}`
	elementoInfoAgentes.textContent = `Agentes conectados: ${infoSesiones.agentes}`
}

function actualizarLogs(log)
{
	while (divLogs.childElementCount >= 10)
	{
		// Eliminar el último
		divLogs.removeChild(divLogs.lastChild)
	}

	let spanLog = document.createElement("span")
	spanLog.className = "log"

	spanLog.textContent = log

	divLogs.insertBefore(spanLog, divLogs.firstChild)
}

function formularioCrearHabitacion(event)
{
	event.preventDefault()

	let nombreHab = this.elements["nombreHab"].value

	if (nombreHab !== "" && nombreHab !== undefined)
	{
		sio.emit("cliente_crear-habitacion", {
			nombre: nombreHab,
			limitesMedidas: {
				maxTemperatura: this.elements["maxTemperatura"].value === "" ? null : parseInt(this.elements["maxTemperatura"].value),
				minTemperatura: this.elements["minTemperatura"].value === "" ? null : parseInt(this.elements["minTemperatura"].value),
				maxLuz: this.elements["maxLuz"].value === "" ? null : parseInt(this.elements["maxLuz"].value),
				minLuz: this.elements["minLuz"].value === "" ? null : parseInt(this.elements["minLuz"].value),
				maxHumedad: this.elements["maxHumedad"].value === "" ? null : parseInt(this.elements["maxHumedad"].value),
				minHumedad: this.elements["minHumedad"].value === "" ? null : parseInt(this.elements["minHumedad"].value)
			}
		})
	}

	this.reset()
}

function crearHabitacion(nombreHab)
{
	console.log("Nombre Habitación: " + nombreHab)

	//
	// Añadir una habitación al HTML
	//
	let listaHabitaciones = document.getElementById("habitaciones")

	// Crear el elemento div de la habitación
	let habitacion = document.createElement("div")
	habitacion.className = "habitacion"
	habitacion.id = nombreHab

	let h2NombreHabitacion = document.createElement("h2")
	h2NombreHabitacion.className = "nombreHabitacion"
	h2NombreHabitacion.textContent = nombreHab

	habitacion.appendChild(h2NombreHabitacion)

	// Crear el div de los actuadores
	let divActuadores = document.createElement("div")
	divActuadores.classList.add("actuadores")

	let h3Actuadores = document.createElement("h3")
	h3Actuadores.className = "nombreActuadores"
	h3Actuadores.textContent = "Actuadores"
	habitacion.appendChild(h3Actuadores)

	// Crear el div de crear actuador
	let divCrearActuador = document.createElement("div")
	divCrearActuador.classList.add("crear-actuador")

	// Crear el formulario de añadir actuador
	let formularioActuador = document.createElement("form")
	formularioActuador.className = "formularioActuador"

	// Crear el label y el select del tipo de actuador
	let labelTipoActuador = document.createElement("label")
	let selectTipoActuador = document.createElement("select")
	selectTipoActuador.name = "tipoActuador"

	// Crear las opciones del select del tipo de actuador

	for (let i = 0; i < TIPO_ACTUADORES.length; i++)
	{
		let opcionActuador = document.createElement("option")

		opcionActuador.value = TIPO_ACTUADORES[i]
		opcionActuador.textContent = TIPO_ACTUADORES[i]

		selectTipoActuador.appendChild(opcionActuador)
	}

	// Agregar el select al label del tipo de actuador
	labelTipoActuador.appendChild(selectTipoActuador);

	// Crear el label y el input del botón de añadir actuador
	let labelBotonActuador = document.createElement("label")
	let botonActuador = document.createElement("input")
	botonActuador.type = "submit"
	botonActuador.name = "aniadirActuador"
	botonActuador.value = "Añadir"

	// Agregar el input al label del botón de añadir actuador
	labelBotonActuador.appendChild(botonActuador)

	// Agregar los elementos al formulario de añadir actuador
	formularioActuador.appendChild(labelTipoActuador)
	formularioActuador.appendChild(labelBotonActuador)

	// Agregar el formulario de añadir actuador al div de crear actuador
	divCrearActuador.appendChild(formularioActuador)

	// Agregar el div de crear actuador al div de los actuadores
	divActuadores.appendChild(divCrearActuador)
	habitacion.appendChild(divActuadores)

	// Crear el div de los sensores
	let divSensores = document.createElement("div")
	divSensores.classList.add("sensores")

	let h3Sensores = document.createElement("h3")
	h3Sensores.className = "nombreSensores"
	h3Sensores.textContent = "Sensores"
	habitacion.appendChild(h3Sensores)

	// Crear el div de crear sensor
	let divCrearSensor = document.createElement("div")
	divCrearSensor.classList.add("crear-sensor")

	// Crear el formulario de añadir sensor
	let formularioSensor = document.createElement("form")
	formularioSensor.className = "formularioSensor"

	// Crear el label y el select del tipo de sensor
	let labelTipoSensor = document.createElement("label")
	let selectTipoSensor = document.createElement("select")
	selectTipoSensor.name = "tipoSensor"

	// Crear las opciones del select del tipo de sensor

	for (let i = 0; i < TIPO_SENSORES.length; i++)
	{
		let opcionSensor = document.createElement("option")
		opcionSensor.value = TIPO_SENSORES[i]
		opcionSensor.textContent = TIPO_SENSORES[i]
		selectTipoSensor.appendChild(opcionSensor)
	}

	// Agregar el select al label del tipo de sensor
	labelTipoSensor.appendChild(selectTipoSensor);

	// Crear el label y el input del botón de añadir sensor
	let labelBotonSensor = document.createElement("label")
	let botonSensor = document.createElement("input")
	botonSensor.type = "submit"
	botonSensor.name = "aniadirSensor"
	botonSensor.value = "Añadir"

	// Agregar el input al label del botón de añadir sensor
	labelBotonSensor.appendChild(botonSensor)

	// Agregar los elementos al formulario de añadir sensor
	formularioSensor.appendChild(labelTipoSensor)
	formularioSensor.appendChild(labelBotonSensor)

	// Agregar el formulario de añadir sensor al div de crear sensor
	divCrearSensor.appendChild(formularioSensor)
	divSensores.appendChild(divCrearSensor)

	habitacion.appendChild(divSensores)

	// Registrar los eventos a los formularios
	formularioActuador.addEventListener("submit", function (event) {
		event.preventDefault()

		let tipoActuador = this.elements["tipoActuador"].value

		sio.emit("cliente_crear-actuador", {
			nombreHabitacion: nombreHab,
			tipoActuador: tipoActuador
		})
	}.bind(formularioActuador))

	formularioSensor.addEventListener("submit", function (event) {
		event.preventDefault()

		let tipoSensor = this.elements["tipoSensor"].value

		sio.emit("cliente_crear-sensor", {
			nombreHabitacion: nombreHab,
			tipoSensor: tipoSensor
		})
	}.bind(formularioSensor))

	// Para borrar la habitación
	let botonBorrar = document.createElement("button")
	botonBorrar.textContent = "Eliminar"
	botonBorrar.className = "bot-borrar"

	botonBorrar.addEventListener("click", (event) => {
		sio.emit("cliente_eliminar-habitacion", nombreHab)
	})

	habitacion.appendChild(botonBorrar)

	// Añadir la habitación
	if (listaHabitaciones.childElementCount === 1)
		listaHabitaciones.insertBefore(habitacion, listaHabitaciones.firstChild)
	else
		listaHabitaciones.insertBefore(habitacion, listaHabitaciones.lastChild.previousSibling)
}

function crearActuador(infoActuador)
{
	const idActuador = infoActuador.idActuador
	const nombreHabitacion = infoActuador.nombreHabitacion
	const tipoActuador = infoActuador.tipoActuador
	const estadoActuador = infoActuador.estadoActuador

	let habitacion = document.getElementById(nombreHabitacion)
	let listaActuadores = habitacion.getElementsByClassName("actuadores")[0]

	// Crear el elemento div
	let divActuador = document.createElement("div")
	divActuador.className = "actuador"
	divActuador.id = "actuador_" + idActuador

	// Crear el elemento span
	let spanTipoActuador = document.createElement('span')
	spanTipoActuador.textContent = tipoActuador

	// Crear el elemento button
	let buttonActuador = document.createElement("button")
	buttonActuador.className = "actuadorBoton"
	buttonActuador.textContent = "Encender"
	buttonActuador.setAttribute("data-estado", infoActuador.estadoActuador)

	buttonActuador.addEventListener("click", () => {
		sio.emit("cliente_cambiar-actuador", {
			idActuador: idActuador,
			estadoActuador: (buttonActuador.dataset.estado === "ON") ? "OFF" : "ON"
		})
	})

	// Agregar los elementos al div actuador
	divActuador.appendChild(spanTipoActuador)
	divActuador.appendChild(buttonActuador)

	// Añadir el botón para eliminar
	let botonBorrar = document.createElement("button")
	botonBorrar.textContent = "Eliminar"
	botonBorrar.className = "bot-borrar"

	botonBorrar.addEventListener("click", (event) => {
		sio.emit("cliente_eliminar-actuador", idActuador)
	})

	divActuador.appendChild(botonBorrar)

	// Añadir el actuador
	if (listaActuadores.childElementCount === 1)
		listaActuadores.insertBefore(divActuador, listaActuadores.firstChild)
	else
		listaActuadores.insertBefore(divActuador, listaActuadores.lastChild)

	// Hacer la actualización del color, etc.
	cambiarEstadoActuador(idActuador, estadoActuador)

	console.log("Creando actuador " + infoActuador.tipoActuador + " en la habitación " + nombreHabitacion)
}

function crearSensor(infoSensor)
{
	const idSensor = infoSensor.idSensor
	const nombreHabitacion = infoSensor.nombreHabitacion
	const tipoSensor = infoSensor.tipoSensor

	let habitacion = document.getElementById(nombreHabitacion)
	let listaSensores = habitacion.getElementsByClassName("sensores")[0]
	
	// Crear el elemento div
	let divSensor = document.createElement("div")
	divSensor.className = "sensor"
	divSensor.id = "sensor_" + idSensor

	// Crear el elemento span
	let spanTipoSensor = document.createElement("span")
	spanTipoSensor.textContent = tipoSensor

	// Crear el elemento form
	let formularioMedir = document.createElement("form")
	formularioMedir.className = "sensorMedir"

	// Crear el elemento label para el input del valor
	let labelValor = document.createElement("label")

	// Crear el input del valor
	let inputValor = document.createElement("input")
	inputValor.type = "text"
	inputValor.name = "valor"

	// Agregar el input del valor al label
	labelValor.appendChild(inputValor)

	// Crear el elemento label para el botón de cambiar valor
	let labelCambiarValor = document.createElement("label")

	// Crear el input del botón de cambiar valor
	let inputCambiarValor = document.createElement("input")
	inputCambiarValor.type = "submit"
	inputCambiarValor.name = "cambiarValor"
	inputCambiarValor.value = "Medir"

	// Agregar el input del botón de cambiar valor al label
	labelCambiarValor.appendChild(inputCambiarValor)

	// Agregar los elementos al formulario
	formularioMedir.appendChild(labelValor)
	formularioMedir.appendChild(labelCambiarValor)

	formularioMedir.addEventListener("submit", function(event) {
		event.preventDefault()

		let medida = this.elements["valor"].value

		if (medida !== "" && medida !== undefined)
		{
			sio.emit("medir-sensor", {
				idSensor: idSensor,
				medida: parseInt(this.elements["valor"].value)
			})
		}

		this.reset()
	}.bind(formularioMedir))

	// Agregar los elementos al div sensor
	divSensor.appendChild(spanTipoSensor)
	divSensor.appendChild(formularioMedir)

	// Añadir el botón para eliminar
	let botonBorrar = document.createElement("button")
	botonBorrar.textContent = "Eliminar"
	botonBorrar.className = "bot-borrar"

	botonBorrar.addEventListener("click", (event) => {
		sio.emit("cliente_eliminar-sensor", idSensor)
	})

	divSensor.appendChild(botonBorrar)

	// Añadir el sensor
	if (listaSensores.childElementCount === 1)
		listaSensores.insertBefore(divSensor, listaSensores.firstChild)
	else
		listaSensores.insertBefore(divSensor, listaSensores.lastChild)

	console.log("Creando sensor " + tipoSensor + " en la habitación " + nombreHabitacion)
}

function cambiarEstadoActuador(idActuador, estadoActuador)
{
	let actuador = document.getElementById("actuador_" + idActuador)
	let botonActuador = actuador.getElementsByClassName("actuadorBoton")[0]

	botonActuador.dataset.estado = estadoActuador

	if (estadoActuador === "ON")
	{
		botonActuador.style.backgroundColor = "#55ff55"
		botonActuador.textContent = "Apagar"
	}
	else if (estadoActuador === "OFF")
	{
		botonActuador.style.backgroundColor = "#ff5555"
		botonActuador.textContent = "Encender"
	}
}

//
// MAIN
//

//
// Inicialización
//
let formularioHabitacion = document.getElementById("formularioHab")
formularioHabitacion.addEventListener("submit", formularioCrearHabitacion)

//
// SOCKET
//

const socket = io("http://localhost:8080", {
	query: { tipo: "cliente" },
})

let sio = socket.connect()
sio.on("cambio-sesiones", (infoSesiones) => {
	console.log("Actualización en las sesiones")
	actualizarSesiones(infoSesiones)
})

// Evento cuando se conecta inicialmente que reciba todas las habitaciones
sio.on("init-habitaciones", (habitaciones) => {
	console.log("Creando las habitaciones")
	console.log(habitaciones)

	habitaciones.forEach((habitacion) => {
		const nombreHabitacion = habitacion.nombre

		crearHabitacion(nombreHabitacion)

		habitacion.actuadores.forEach((infoActuador) => {
			infoActuador.idActuador = infoActuador._id
			crearActuador(infoActuador)
		})

		habitacion.sensores.forEach((infoSensor) => {
			infoSensor.idSensor = infoSensor._id
			crearSensor(infoSensor)
		})
	});

	// Como es inicialización, se desuscribe
	sio.removeAllListeners("init-habitaciones")
})

//
// Creación
//

sio.on("nueva-habitacion", (infoHabitacion) => {
	console.log("Alguien ha creado una nueva habitación")
	console.log(infoHabitacion)
	crearHabitacion(infoHabitacion.nombre)
})

sio.on("nuevo-actuador", (infoActuador) => {
	console.log("Alguien ha creado un nuevo actuador")
	crearActuador(infoActuador)
})

sio.on("nuevo-sensor", (infoSensor) => {
	console.log("Alguien ha creado un nuevo sensor")
	crearSensor(infoSensor)
})

//
// Cambios
//

sio.on("log", (log) => {
	actualizarLogs(log)
})

sio.on("cambiar-actuador", (actuador) => {
	// Hacer el toggle del acutador
	console.log("Alguien actualiza un actuador")
	console.log(actuador)

	cambiarEstadoActuador(actuador.idActuador, actuador.estadoActuador)
})

//
// Destrucción
//

sio.on("eliminar-habitacion", (nombreHabitacion) => {
	let habitacion = document.getElementById(nombreHabitacion)
	habitacion.parentElement.removeChild(habitacion)
})

sio.on("eliminar-actuador", (idActuador) => {
	let actuador = document.getElementById("actuador_" + idActuador)
	actuador.parentElement.removeChild(actuador)
})

sio.on("eliminar-sensor", (idSensor) => {
	let sensor = document.getElementById("sensor_" + idSensor)
	sensor.parentElement.removeChild(sensor)
})
