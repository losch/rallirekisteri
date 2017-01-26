import io from 'socket.io-client';
import * as api from './api';

let socket;

export function withSocket(after) {
  if (!socket) {
    socket = io.connect();
    after(socket);
  }
  else {
    after(socket);
  }
}

export function emit(msg, ...data) {
  withSocket(socket => {
    socket.emit(msg, ...data);
  });
}

