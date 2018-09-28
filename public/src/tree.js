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
const drawNode = function ({ x, y, isDelete, value }) {
  const circle = new Konva.Circle({
    radius: r / 2,
    x,
    y,
    fill: isDelete ? '#D3D3D3' : 'red',
    stroke: 'black',
    strokeWidth: 5
  })
  const t = JSON.stringify(value)
  console.log('draw node', t)
  const text = new Konva.Text({
    x: x - 8,
    y: y - 15,
    text: t.slice(1, t.length - 1),
    fontSize: 30,
    fontFamily: 'Calibri',
    fill: 'white'
  })

  layer.add(circle)
  layer.add(text)
}

const drawArrw = function (arrw) {

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
    info.value = node.word.value
    info.isDelete = node.word.isDelete
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
      return boxX + left
    }
    for (let n of tree.nextNode) {
      left = getWidth(n, left)
      setX(n, left)
    }
    return left
  }
  const getHight = function (tree, h) {
    setY(tree, h)
    if (tree.nextNode.length <= 0) return h
    for (let n of tree.nextNode) {
      getHight(n, h + boxY)
    }
  }
  const w = getWidth(tree, 0)
  setX(tree, w)
  getHight(tree, r)
  console.log(ns)
  for (let node of ns.values()) {
    console.log(node)
    drawNode(node)
  }
  layer.draw()
  window.l = layer
}

const clear = function () {
  layer.clear()
  layer.destroy()
}

module.exports = { draw, clear }
