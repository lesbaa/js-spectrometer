/* eslint-env browser */

import createCanvas from './lib/createCanvas'
import loadAudio from './lib/loadAudio'

const FFT_SIZE = 1024
const INCREMENT_PER_FRAME = 25
const RESOLUTION = 0.8
const COLOR_GAIN = 15

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
    const halfCanvasWidthUnit = canvasWidthUnit * RESOLUTION
  
    audio.element.play()

    let j = 0

    const loop = () => {
      requestAnimationFrame(loop)
      analyserL.getFloatFrequencyData(floatFrequencyDataL)
      analyserR.getFloatFrequencyData(floatFrequencyDataR)

      for (let i = 0; i < bufferLength; i++) {
        const outputL = Math.pow(1.8, floatFrequencyDataL[i] / COLOR_GAIN)
        const outputR = Math.pow(1.8, floatFrequencyDataR[i] / COLOR_GAIN)
        const isOutOfBounds =
          i * halfCanvasWidthUnit + halfCanvas > canvasWidth ||
          i * halfCanvasWidthUnit + halfCanvas < 0

        if (isOutOfBounds) { continue }
        // L
        ctx.fillStyle = `hsl(${360 * -outputL + 180}deg, 100%, ${outputL * 100}%)`
        ctx.fillRect(i * halfCanvasWidthUnit + halfCanvas, 0, (i + 1) * halfCanvasWidthUnit, INCREMENT_PER_FRAME)
        // R
        ctx.fillStyle = `hsl(${360 * -outputR + 180}deg, 100%, ${outputR * 100}%)`
        ctx.fillRect(-i * halfCanvasWidthUnit + halfCanvas, 0, (-i - 1) * halfCanvasWidthUnit, INCREMENT_PER_FRAME)

      }

      ctx.save()
      ctx.translate(0, INCREMENT_PER_FRAME)
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()

      j+= INCREMENT_PER_FRAME
    }

    loop()

  } catch (e) {
    console.error(e)
  }
}

main()
