const io = require('socket.io-client')

const { State } = require('./lib')

const socket = io('http://localhost:8888')

class ClientState extends State {
  addAction (action) {
    super.addAction(action)
    const actionsInfo = JSON.stringify([action])
    socket.emit('client-actions', actionsInfo)
  }

  serverAddAction (action) {
    super.addAction(action)
  }
}

module.exports = {
  socket,
  ClientState
}
