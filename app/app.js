/* eslint-env browser */

import createCanvas from './lib/createCanvas'
import loadAudio from './lib/loadAudio'

const FFT_SIZE = 1024
const INCREMENT_PER_FRAME = 8
const SCALE = 1 // 0.1 < r < 5
const COLOR_GAIN = 13
let BASE_COLOR_HUE = 180 

async function createPlayer({
  ctx,
  canvas,
  uri,
}) {
  let animFrameId = null

  try {

    const audio = await loadAudio(uri)
    const splitter = audio.ctx.createChannelSplitter(2)
    audio.src.connect(splitter)

    const merger = audio.ctx.createChannelMerger(2)

    const analyserL = audio.ctx.createAnalyser()
    analyserL.fftSize = FFT_SIZE
    splitter.connect(analyserL, 0)
    analyserL.connect(merger, 0, 0)
    
    const analyserR = audio.ctx.createAnalyser()
    analyserR.fftSize = FFT_SIZE
    splitter.connect(analyserR, 1)
    analyserR.connect(merger, 0, 1)

    merger.connect(audio.ctx.destination)

    const bufferLength = analyserL.frequencyBinCount
    const floatFrequencyDataL = new Float32Array(bufferLength)
    const floatFrequencyDataR = new Float32Array(bufferLength)

    const canvasHeight = canvas.height
    const canvasWidth = canvas.width
    const canvasWidthUnit = canvasWidth / bufferLength

    const halfCanvas = canvasWidth / 2
    const halfCanvasWidthUnit = canvasWidthUnit * SCALE
    
    const loop = () => {
      animFrameId = requestAnimationFrame(loop)
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
        ctx.fillRect(-i * halfCanvasWidthUnit + halfCanvas, canvasHeight - INCREMENT_PER_FRAME, halfCanvasWidthUnit, INCREMENT_PER_FRAME)

        // R
        ctx.fillStyle = `hsl(${360 * -outputR + colorShift}deg, 100%, ${outputR * 100}%)`
        ctx.fillRect(i * halfCanvasWidthUnit + halfCanvas, canvasHeight - INCREMENT_PER_FRAME, halfCanvasWidthUnit, INCREMENT_PER_FRAME)

      }

      ctx.save()
      ctx.translate(0, -INCREMENT_PER_FRAME)
      ctx.drawImage(canvas, 0, 0)
      ctx.restore()
    }

    const stop = () => {
      audio.element.pause()
      audio.element.fastSeek(0)
      cancelAnimationFrame(animFrameId)
    }

    const play = () => {
      audio.element.play()
      loop()
    }

    return {
      audio,
      play,
      stop,
      uri,
    }

  } catch (e) {
    console.error(e)
  }
}

  
const {
  ctx,
  canvas,
} = createCanvas({
  parent: document.body,
})

const createOptionElement = ({ uri, displayName }) => {
  const option = document.createElement('option')
  option.value = uri
  option.innerText = displayName
  return option
}

const createSelect = (options) => {
  const selectElement = document.createElement('select')

  selectElement.className = 'tune-select'

  options
    .map(createOptionElement)
    .forEach(el => selectElement.appendChild(el))

  document.body.appendChild(selectElement)

  return selectElement
}

const tunes = [
  {
    uri: '/static/rh.mp3',
    displayName: 'Idiotheque - Radiohead',
  },
  {
    uri: '/static/cormorant.mp3',
    displayName: 'Caffeine Shakes (and other tales of sleep deprivation) - The Cormorant',
  },
  {
    uri: '/static/stereo.mp3',
    displayName: 'Audio Fidelity Stereo Spectacular Demonstration & Sound Effects (1963 - Side 1)',
  },
]

async function init() {
  const state = {
    activePlayer: tunes[0].uri,
  }

  const selectElement = createSelect(tunes)

  const loadedPlayers = await Promise.all(tunes
    .map(async ({ uri }) =>
      await createPlayer({
        ctx,
        canvas,
        uri,
      }),
    ))

  const players = loadedPlayers
    .reduce((acc, el) => ({
      ...acc,
      [el.uri]: el,
    }), {})

  selectElement.addEventListener('change', async ({ target: { value } }) => {
    if (players[state.activePlayer]) players[state.activePlayer].stop()

    players[value].play()
    state.activePlayer = value
  })
  
  players[state.activePlayer].play()
}

init()