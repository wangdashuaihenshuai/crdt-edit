const { diff } = require('./util')
const { ADD, DELETE, OPERAT_MAP } = require('./const')

class TimeStampManager {
  constructor (timeStamp = 0) {
    this.timeStamp = timeStamp
  }

  getTimeStamp () {
    this.timeStamp++
    return this.timeStamp
  }

  setTimeStamp (timeStamp) {
    this.timeStamp = timeStamp
  }

  updateTimeStamp (newTimeStamp) {
    if (newTimeStamp > this.timeStamp) this.timeStamp = newTimeStamp
  }
}

class IdManager {
  constructor () {
    this.id = 0
  }

  getId () {
    this.id++
    return this.id
  }
}

class Id {
  constructor (uid, timeStamp) {
    this.uid = uid
    this.timeStamp = timeStamp
  }

  bigger (id) {
    if (this.timeStamp > id.timeStamp) return true
    if (this.timeStamp === id.timeStamp && this.uid > id.uid) return true
    return false
  }

  small (id) {
    return !this.bigger(id)
  }

  equal (id) {
    return id.uid === this.uid && id.timeStamp === this.timeStamp
  }

  toString () {
    return `U${this.uid}@T${this.timeStamp}`
  }

  toJSON () {
    const { uid, timeStamp } = this
    return { uid, timeStamp }
  }
}

const loadId = function (idInfo) {
  if (idInfo === null) return null
  const { uid, timeStamp } = idInfo
  return new Id(uid, timeStamp)
}

const loadActionsInfo = function (actionsInfo) {
  return JSON.parse(actionsInfo).map(action => {
    const id = loadId(action.id)
    const preId = loadId(action.preId)
    const { operat, value } = action
    return new Action(preId, id, operat, value)
  })
}

class Action {
  constructor (preId, id, operat, value) {
    this.preId = preId
    this.id = id
    this.operat = operat
    this.value = value
  }

  toString () {
    return `${this.id && this.id.toString()}\t ${OPERAT_MAP[this.operat]}\t ${this.preId && this.preId.toString()}\t ${this.value}`
  }

  toJSON () {
    const { preId, id, operat, value } = this
    return {
      operat,
      preId,
      value,
      id
    }
  }
}

class Word {
  constructor (id, value, preId, operat) {
    this.id = id
    this.isDelete = false
    this.preId = preId
    this.operat = operat
    this.value = value
  }

  delete () {
    this.isDelete = true
  }
}

class Info {
  constructor (operat, chars) {
    this.operat = operat
    this.chars = chars
  }
}

class Node {
  constructor (word) {
    this.word = word
    this.nextNode = []
  }

  addNext (node) {
    if (!this.hasNext(node)) {
      this.nextNode.push(node)
      return true
    }
    return false
  }

  toJSON () {
    const { id, preId, operat, value } = this.word
    return {
      id,
      preId,
      operat,
      value
    }
  }

  hasNext (node) {
    for (const n of this.nextNode) {
      if (n.word.id.equal(node.word.id)) return true
    }
    return false
  }

  getNodeByposition (position) {
    console.log(this.toJSON())
    if (position <= 0) {
      return this.word.id
    }
    for (let n of this.nextNode) {
      if (!n.word.isDelete) {
        position = position - 1
      }
      const re = n.getNodeByposition(position)
      if (re !== null) return re
    }
    return null
  }

  getStr () {
    const str = this.word.isDelete ? '' : this.word.value
    if (this.nextNode.length === 0) {
      return str
    }

    const nextNode = this.nextNode.sort((a, b) => a.word.id.bigger(b.word.id) ? -1 : 1)
    return str + nextNode.map(n => n.getStr()).join('')
  }
}

class State {
  constructor (timeStamp, uid) {
    this.timeStampManager = new TimeStampManager(timeStamp)
    this.uid = uid
    this.nodes = new Map()
    const id = new Id(0, 0)
    const word = new Word(id, '', id, ADD)
    this.tree = new Node(word)
    this.nodes.set(id.toString(), this.tree)
  }

  createId () {
    return new Id(this.uid, this.timeStampManager.getTimeStamp())
  }

  addOldActins (oldActions) {
    const actions = []
    let preId = null
    for (let oldAction of oldActions) {
      for (let info of oldAction.infos) {
        let i = 0
        const chars = info.chars.split('')
        if (info.operat === DELETE) {
          i = chars.length - 1
          chars.reverse()
        }
        console.log(info)
        for (let char of chars) {
          preId = this.getPreId(oldAction.position + i)
          console.log('get preId', preId, oldAction.position + i)
          if (info.operat === DELETE) {
            i--
          } else {
            i++
          }
          const id = this.createId()
          const action = new Action(preId, id, info.operat, char)
          this.addAction(action)
          actions.push(action)
        }
      }
    }
    return actions
  }

  update (newStr) {
    const oldStr = this.toString()
    console.log('newStr', newStr)
    console.log('oldStr', oldStr)
    const oldActions = diff(oldStr, newStr)
    this.addOldActins(oldActions)
    return this.toString()
  }

  toString () {
    return this.tree.getStr()
  }

  getPreId (position) {
    return this.tree.getNodeByposition(position)
  }

  addAction (action) {
    if (this.nodes.get(action.id.toString())) {
      return
    }
    console.log(action.toString(), action)
    console.log(action)
    const node = this.nodes.get(action.preId.toString())
    switch (action.operat) {
      case ADD:
        const id = action.id
        const word = new Word(action.id, action.value, action.preId, action.operat)
        const newNode = new Node(word)
        this.nodes.set(id.toString(), newNode)
        console.log('add node', node)
        node.addNext(newNode)
        break
      case DELETE:
        node.word.delete()
        break
      default:
    }
    this.timeStampManager.updateTimeStamp(action.id.timeStamp)
  }
}

module.exports = {
  loadActionsInfo,
  TimeStampManager,
  IdManager,
  Action,
  State,
  Info,
  Id
}
