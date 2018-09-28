const express = require('express')
const app = require('express')()
const http = require('http').Server(app)
const path = require('path')
const io = require('socket.io')(http)

const serverState = require('./server')
const { loadActionsInfo } = require('./lib')

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => {
  const uid = serverState.uidManager.getId()
  const timeStamp = serverState.timeStampManager.getTimeStamp()
  const actionsInfo = JSON.stringify([...serverState.nodes.values()])
  socket.emit('client-init', { uid, timeStamp, actionsInfo })

  socket.on('client-actions', (actionsInfo) => {
    const actions = loadActionsInfo(actionsInfo)
    for (let action of actions) {
      serverState.addAction(action)
      console.log('barodcast')
      socket.broadcast.emit('server-actions', actionsInfo)
    }
  })

  socket.on('client-connect', (data) => {
    socket.broadcast.emit('new message', {
    })
  })

  socket.on('add user', (username) => {
  })
})

http.listen(8888, function () {
  console.log('listening on *:8888')
})
