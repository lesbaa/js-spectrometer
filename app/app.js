/* eslint-env browser */

import createCanvas from './lib/createCanvas'
import loadAudio from './lib/loadAudio'

const FFT_SIZE = 1024
const INCREMENT_PER_FRAME = 8
const SCALE = 1 // 0.1 < r < 5
const COLOR_GAIN = 12
let BASE_COLOR_HUE = 180 

async function main() {
  const {
    ctx,
    canvas,
  } = createCanvas({
    parent: document.body,
  })

  try {

    const audio = await loadAudio('/static/cormorant.mp3')

    const splitter = audio.ctx.createChannelSplitter(2)
    audio.src.connect(splitter)

    const merger = audio.ctx.createChannelMerger(2)

    const analyserL = audio.ctx.createAnalyser()
    analyserL.fftSize = FFT_SIZE
    splitter.connect(analyserL, 0)
    analyserL.connect(merger, 0)
    
    const analyserR = audio.ctx.createAnalyser()
    analyserR.fftSize = FFT_SIZE
    splitter.connect(analyserR, 0)
    analyserR.connect(merger, 0, 1)

    merger.connect(audio.ctx.destination)

    const bufferLength = analyserL.frequencyBinCount
    const floatFrequencyDataL = new Float32Array(bufferLength)
    const floatFrequencyDataR = new Float32Array(bufferLength)

    const canvasWidth = canvas.width
    const canvasWidthUnit = canvasWidth / bufferLength

    const halfCanvas = canvasWidth / 2
    const halfCanvasWidthUnit = canvasWidthUnit * SCALE
  
    audio.element.play()

    
    const loop = () => {
      requestAnimationFrame(loop)
      analyserL.getFloatFrequencyData(floatFrequencyDataL)
      analyserR.getFloatFrequencyData(floatFrequencyDataR)

      for (let i = 0; i < bufferLength; i++) {
        const isOutOfBounds =
        i * halfCanvasWidthUnit + halfCanvas > canvasWidth ||
        i * halfCanvasWidthUnit + halfCanvas < 0
        
        if (isOutOfBounds) { continue }

        const outputL = Math.pow(1.8, floatFrequencyDataL[i] / COLOR_GAIN)
        const outputR = Math.pow(1.8, floatFrequencyDataR[i] / COLOR_GAIN)
        const colorShift = + BASE_COLOR_HUE + i / 3
        // L
        ctx.fillStyle = `hsl(${360 * -outputL + colorShift}deg, 100%, ${outputL * 100}%)`
        ctx.fillRect(i * halfCanvasWidthUnit + halfCanvas, 0, halfCanvasWidthUnit, INCREMENT_PER_FRAME)
        // R
        ctx.fillStyle = `hsl(${360 * -outputR + colorShift}deg, 100%, ${outputR * 100}%)`
        ctx.fillRect(-i * halfCanvasWidthUnit + halfCanvas, 0, halfCanvasWidthUnit, INCREMENT_PER_FRAME)

      }

      ctx.save()
      ctx.translate(0, INCREMENT_PER_FRAME)
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()
    }

    loop()

  } catch (e) {
    console.error(e)
  }
}

main()
