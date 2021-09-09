import { io } from 'socket.io-client';

let socket;

export const initiateSocketConnection = () => {
	socket = io(process.env.REACT_APP_SOCKET_ENDPOINT);
	console.log(`Connecting socket...`);
}

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}

export const connectToAlpaca = (symbols_array) => {
	if (socket) {
		socket.emit('alpaca connect', symbols_array);
	}
}

export const receiveAlpacaData = () => {
	if (socket) {
		socket.on('alpaca connect', function(data) {
			// need to set state here
			console.log('here is the fuckin data', data);
		});
	}
}
