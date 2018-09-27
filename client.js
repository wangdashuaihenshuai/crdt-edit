const { State, loadActionsInfo } = require('./lib')
const socket = require('./socket')

class ClientState extends State {
  addAction (action) {
    super.addAction(action)
    const actionsInfo = JSON.stringify([action])
    socket.emit('client-actions', actionsInfo)
  }

  serverAddAction (action) {
    this.addAction(action)
  }
}

let clientState = null

socket.on('client-init', (info) => {
  const { uid, timeStamp, actionsInfo } = info
  clientState = new ClientState(timeStamp, uid)
  const actions = loadActionsInfo(actionsInfo)
  for (let action of actions) {
    clientState.serverAddAction(action)
  }
})

const clientInit = function () {
  socket.emit('client-connect')
}

const getClientState = function () {
  return clientState
}

module.exports = {
  getClientState,
  clientInit
}
