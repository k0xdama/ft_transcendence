import { createContext, useContext, useState, useRef } from "react";
import { io } from "socket.io-client";

const LobbyContext = createContext(null);

export function useLobby() {
	return useContext(LobbyContext);
}

export function LobbyProvider({ children }) {
	const [lobbyStruct, setLobbyStruct] = useState(null);
	const [lobbyId, setLobbyId] = useState(null);
	const [gameId, setGameId] = useState(null);
	const [lobbyError, setLobbyError] = useState(null);
	const socketRef = useRef(null);
	const lobbyUrl = '/api/lobby';

	const connect = (onConnected, onConnectionError, onLobbyCreated, onLobbyJoined) => {
		if (socketRef.current)
			return;

		socketRef.current = io({
			path: `${lobbyUrl}/socket.io`,
			withCredentials: true,
			transports: ['websocket'],
			reconnection: false
		});

		socketRef.current.on('lobby:created', ({ lobbyId }) => {
			setLobbyId(lobbyId);
			if (onLobbyCreated)
				onLobbyCreated(lobbyId);
		});

		socketRef.current.on('lobby:joined', ({ lobbyStruct }) => {
			setLobbyStruct(lobbyStruct);
			setLobbyId(lobbyStruct.lobbyId);
			if (onLobbyJoined)
				onLobbyJoined(lobbyStruct.lobbyId);
		});

		socketRef.current.on('lobby:readyChanged', (struct) => {
			setLobbyStruct(struct.lobbyStruct);
		});

		socketRef.current.on('lobby:disconnected', ({ userId }) => {
			setLobbyStruct(prev => ({
				...prev,
				users: prev.users.filter(u => u.id !== userId)
			}));
		});

		socketRef.current.on('lobby:gameStarting', ({ gameId }) => {
			setGameId(gameId);
		});

		socketRef.current.on('connect', () => {
			if(onConnected)
				onConnected();
		});

		socketRef.current.on('connect_error', (err) => {
			console.error('Connection failed:', err.message);
			socketRef.current = null;
			if (onConnectionError)
				onConnectionError(err.message);
		});

		socketRef.current.on('error', (message) => {
			setLobbyError(message);
		});
	}

	const createLobby = (gameMode, gameType, maxUsers) => {
		socketRef.current.emit('lobby:create', { gameMode, gameType, maxUsers });
	};

	const joinLobby = (lobbyId) => {
		socketRef.current.emit('lobby:join', { lobbyId });
	};

	const toggleReady = (lobbyId) => {
		socketRef.current.emit('lobby:ready', { lobbyId });
	};
	
	const startGame = (lobbyId) => {
		socketRef.current.emit('lobby:start', { lobbyId });
	};

	return (
		<LobbyContext.Provider value={{
			lobbyStruct,
			lobbyError,
			setLobbyError,
			lobbyId,
			connect,
			createLobby,
			joinLobby,
			toggleReady,
			startGame,
			gameId
		}}>
			{children}
		</LobbyContext.Provider>
	);
}
