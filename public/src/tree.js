const Konva = require('Konva')
var stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight
})

var layer = new Konva.Layer()
const r = 40
const boxX = 80
const boxY = 60
const drawNode = function ({ x, y, id, isDelete, value }, preNode) {
  const circle = new Konva.Circle({
    radius: r / 2,
    x,
    y,
    fill: isDelete ? '#D3D3D3' : 'red',
    stroke: 'black',
    strokeWidth: 5
  })
  layer.add(circle)
}

const drawText = function ({ x, y, id, isDelete, value }, preNode) {
  const t = JSON.stringify(value)
  const text = new Konva.Text({
    x: x - 8,
    y: y - 15,
    text: t.slice(1, t.length - 1),
    fontSize: 30,
    fontFamily: 'Calibri',
    fill: 'white'
  })
  layer.add(text)
}
const drawArraw = function ({ x, y, id, isDelete, value }, preNode) {
  if (id !== preNode.id) {
    const arrow = new Konva.Arrow({
      x: 0,
      y: 0,
      points: [x, y, preNode.x, preNode.y],
      pointerLength: 8,
      pointerWidth: 8,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 5
    })
    layer.add(arrow)
  }
}

const draw = function (tree) {
  layer.clear()
  layer.destroy()
  layer = new Konva.Layer()
  stage.add(layer)
  console.log(tree)
  const ns = new Map()
  const setX = function (node, x) {
    let info = ns.get(node.word.id.toString())
    if (!info) {
      info = {}
    }
    info.x = x
    info.id = node.word.id.toString()
    info.value = node.word.value
    info.isDelete = node.word.isDelete
    info.preId = node.word.preId.toString()
    ns.set(node.word.id.toString(), info)
  }

  const setY = function (node, y) {
    let info = ns.get(node.word.id.toString())
    if (!info) {
      info = {}
    }
    info.y = y
    ns.set(node.word.id.toString(), info)
  }
  const getWidth = function (tree, left) {
    if (tree.nextNode.length <= 0) {
      setX(tree, left + boxX / 2)
      return boxX
    }
    let w = 0
    for (let n of tree.nextNode) {
      w = w + getWidth(n, left + w)
    }
    setX(tree, left + w / 2)
    return w
  }

  const getHight = function (tree, h) {
    setY(tree, h)
    if (tree.nextNode.length <= 0) return h
    for (let n of tree.nextNode) {
      getHight(n, h + boxY)
    }
  }
  getWidth(tree, 0)
  getHight(tree, r)
  console.log(ns)

  for (let node of ns.values()) {
    const preNode = ns.get(node.preId)
    drawArraw(node, preNode)
  }

  for (let node of ns.values()) {
    const preNode = ns.get(node.preId)
    drawNode(node, preNode)
  }

  for (let node of ns.values()) {
    const preNode = ns.get(node.preId)
    drawText(node, preNode)
  }

  layer.draw()
  window.l = layer
}

const clear = function () {
  layer.clear()
  layer.destroy()
}

module.exports = { draw, clear }
