import React, { useEffect } from 'react'
import { useCanvas } from '../context/CanvasContext'
import { api } from '../utils/api'

export function Canvas() {
  const { canvasRef, prepareCanvas, startDrawing, finishDrawing, draw } =
    useCanvas()

  useEffect(() => {
    prepareCanvas()
  }, [])

  return (
    <canvas
      className="bg-white"
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      ref={canvasRef}
    />
  )
}
