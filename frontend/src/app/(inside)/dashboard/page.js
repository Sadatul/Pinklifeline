'use client'
import socketIo from 'socket.io-client';
const socket = socketIo.connect('http://localhost:5000');

export default function DashBoard() {
  return (
    <div>
      <p>Hello World!</p>
    </div>
  );
}