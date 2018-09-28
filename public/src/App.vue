<template>
  <div id="app">
    <span>Multiline message is:</span>
    <textarea v-model="message" @input="onChange" class="input-area" placeholder="add multiple lines"></textarea>
    <button @click="draw">绘制</button>
    <button @click="clear">清除</button>
  </div>
</template>

<script>
const {ClientState, socket} = require('./client')
const { loadActionsInfo } = require('./lib')
const {draw, clear} = require('./tree')

socket.on('connect', onConnect)

function onConnect () {
  console.log('connect ' + socket.id)
}


export default {
  name: 'app',
  created() {
    socket.on('server-actions', (actionsInfo) => {
      const actions = loadActionsInfo(actionsInfo)
      for (let action of actions) {
        this.clientState.serverAddAction(action)
      }
      this.message = this.clientState.toString()
    })

    socket.on('client-init', (info) => {
      console.log('client -init')
      const { uid, timeStamp, actionsInfo } = info
      this.clientState = new ClientState(timeStamp, uid)
      window.clientState = this.clientState
      const actions = loadActionsInfo(actionsInfo)
      for (let action of actions) {
        this.clientState.serverAddAction(action)
      }
      this.message = this.clientState.toString()
    })
  },
  data () {
    return {
      clientState: null,
      message: ''
    }
  },
  methods: {
    draw() {
      clear()
      draw(this.clientState.tree)
    },
    clear() {
      clear()
    },
    onChange(value) {
      this.clientState.update(this.message)
      draw(this.clientState.tree)
      this.message = this.clientState.toString()
    }
  }
}
</script>

<style>
.input-area {
  display: block;
  width: 80%;
  height: 400px;
  font-size: 1rem;
  margin: auto;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
