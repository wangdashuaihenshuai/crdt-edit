const jsdiff = require('diff')
const { ADD, DELETE } = require('./const')

class OldAction {
  constructor (position, infos) {
    this.position = position
    this.infos = infos
  }
}

const diff = function (oldStr, newStr) {
  const parts = jsdiff.diffChars(oldStr, newStr)
  let index = 0
  const infosMap = new Map()

  for (const p of parts) {
    let infos = infosMap.get(index)

    if (p.added === true || p.removed === true) {
      switch (true) {
        case p.added:
          if (!infos) {
            infos = []
            infosMap.set(index, infos)
          }
          infos.push({ operat: ADD, chars: p.value })
          break
        case p.removed:
          if (!infos) {
            infos = []
            infosMap.set(index + 1, infos)
          }
          infos.push({ operat: DELETE, chars: p.value })
          break
        default:
      }
    }

    if (p.removed !== true) {
      index = index + p.count
    }
  }
  const oldActions = []
  for (let [position, infos] of infosMap.entries()) {
    oldActions.push(new OldAction(position, infos))
  }
  return oldActions
}

module.exports = {
  diff
}
