const serverState = require('./server')
const { getClientState, clientInit } = require('./client')
serverState.update('123456')
serverState.update('4567')
serverState.update('888')

clientInit()
const clientState = getClientState()

console.log(clientState.toString())
console.log(serverState.toString())
