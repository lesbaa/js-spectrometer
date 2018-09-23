export default (src) => new Promise((resolve, reject) => {
  const element = document.createElement('audio')

  element.addEventListener('canplay', () => {
    const ctx = new AudioContext()
    const src = ctx.createMediaElementSource(element)

    resolve({
      ctx,
      src,
      element,
    })
  })

  element.addEventListener('error', reject)

  element.src = src
})