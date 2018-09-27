const { State, IdManager, loadActionsInfo } = require('./lib')
const socket = require('./socket')

class ServerState extends State {
  constructor (...args) {
    super(...args)
    this.uidManager = new IdManager()

    this.init()
  }

  init () {
    socket.on('client-connect', () => {
      const uid = this.uidManager.getId()
      const timeStamp = this.timeStampManager.getTimeStamp()
      const actionsInfo = JSON.stringify([...this.nodes.values()].filter(n => !n.word.isDelete))
      socket.emit('client-init', { uid, timeStamp, actionsInfo })
    })

    socket.on('client-disconnect', () => {
    })

    socket.on('client-reconnect', () => {
    })

    socket.on('client-actions', (actionsInfo) => {
      const actions = loadActionsInfo(actionsInfo)
      for (let action of actions) {
        this.selfAddAction(action)
      }
    })

    socket.on('client-commit', () => {

    })
  }

  selfAddAction (action) {
    this.addAction(action)
  }
}

const serverState = new ServerState(0, 0)
module.exports = serverState
