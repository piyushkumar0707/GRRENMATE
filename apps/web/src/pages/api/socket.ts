// Next.js API Route for Socket.IO Server
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import { Server as SocketIOServer } from 'socket.io'
import { initializeSocketIO } from '@/lib/socket-server'

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket.IO server already initialized')
    res.end()
    return
  }

  console.log('Initializing Socket.IO server...')
  
  const httpServer: SocketServer = res.socket.server as any
  const io = initializeSocketIO(httpServer)

  // Store the IO instance on the server
  httpServer.io = io

  console.log('Socket.IO server initialized successfully')
  res.end()
}

export default SocketHandler