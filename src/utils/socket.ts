import {io, Socket} from 'socket.io-client';
import { Endpoints } from './const';
import { ChainID } from './chains';

class ClientSocket {
  private socket: Socket;

  constructor() {
    this.socket = io(Endpoints[ChainID.ARB_GOERLI]);
  }

  public on(eventName: string, callback: Function) {
    this.socket.on(eventName, callback as any);
  }

  public emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}

export default new ClientSocket();