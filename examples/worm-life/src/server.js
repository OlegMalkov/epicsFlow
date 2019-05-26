const server = require('http').createServer()
const io = require('socket.io')(server)

let worldState

const worldSockets = []
const controllerSockets = []

io.on('connection', client => {
	client.on('identity', ({ type, name, color }) => {

		if (type === 'world') {
			client.type = 'world'
			client.emit('worldState', worldState)
			worldSockets.push(client)
			client.on('disconnect', () => {
				worldSockets.splice(worldSockets.indexOf(client), 1)
			})
			client.on('worldState', _ws => {
				worldState = _ws
				controllerSockets.forEach(socket => {
					socket.emit('wormState', worldState.worms[socket.name])
				})
			})
		} else if (type === 'controller') {
			client.type = 'controller'
			client.name = name
			client.color = color
			controllerSockets.push(client)
			if (worldState) {
				if (!worldState.worms[name]) {
					worldSockets.forEach(ws => ws.emit('createWorm', { name, color }))
				}
			}
			client.on('disconnect', () => {
				controllerSockets.splice(controllerSockets.indexOf(client), 1)
			})

			client.on('burnSubcounscious', script => {
				worldSockets.forEach(ws => ws.emit('burnSubcounscious', { name: client.name, script }))
			})
		}
	})
})

server.listen(3005)
