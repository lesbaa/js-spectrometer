export default ({
  width = window.innerWidth,
  height = window.innerHeight,
  parent,
}) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  if (parent) {
    console.log('appending child')
    parent.appendChild(canvas)
  }

  return {
    canvas,
    ctx: canvas.getContext('2d'),
  }
}