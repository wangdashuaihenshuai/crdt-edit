const { State, IdManager } = require('./public/src/lib')

class ServerState extends State {
  constructor (...args) {
    super(...args)
    this.uidManager = new IdManager()
  }
}

const serverState = new ServerState(0, 0)
module.exports = serverState
