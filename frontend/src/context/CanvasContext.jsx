import React, { useContext, useRef, useState } from 'react'
import { api } from '../utils/api'

const CanvasContext = React.createContext()

export const CanvasProvider = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const contextRef = useRef(null)

  const prepareCanvas = () => {
    const canvas = canvasRef.current
    canvas.width = 1650
    canvas.height = 1050
    canvas.style.width = '825px'
    canvas.style.height = '525px'

    const context = canvas.getContext('2d')
    context.scale(2, 2)
    context.lineCap = 'round'
    context.strokeStyle = 'black'
    context.lineWidth = 5
    contextRef.current = context
  }

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }

  const finishDrawing = () => {
    setIsDrawing(false)
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return
    }
    const { offsetX, offsetY } = nativeEvent
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const getBase64Data = () => {
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, '')
    return base64Data
  }

  const submitQuestion = (roomNum, currentQuestion, playerUsername) => {
    finishDrawing()

    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, '')
    // console.log(base64Data)
    const req = {
      room_num: roomNum,
      player_id: playerUsername,
      imageData: base64Data,
      current_question: currentQuestion,
    }

    // Mock API
    console.log(new Date(), 'submitQuestion called...')
    // setTimeout(() => {
    //   clearCanvas()
    // }, 100)
    api
      .post('/submitQuestion', req)
      .then((data) => {
        console.log(new Date(), 'submitted...', req)
        console.log(data)
        // clearCanvas()
      })
      .catch((err) => {
        console.log(new Date(), 'submitted...', req)
        console.log(err)
        // clearCanvas()
      })

    clearCanvas()
  }

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        contextRef,
        prepareCanvas,
        startDrawing,
        finishDrawing,
        clearCanvas,
        draw,
        getBase64Data,
        submitQuestion,
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export const useCanvas = () => useContext(CanvasContext)
