import { createContext, useContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"
import { logError } from "../utils/logger.js"

const LobbyContext = createContext(null);

export function useLobby() {
	return useContext(LobbyContext);
}

export function LobbyProvider({ children }) {
	const [lobbyStruct, setLobbyStruct] = useState(null);
	const [lobbyId, setLobbyId] = useState(null);
	const [gameId, setGameId] = useState(null);
	const [matchmakingStatus, setMatchmakingStatus] = useState(null);
	const [connected, setConnected] = useState(false)
	const [lobbyError, setLobbyError] = useState(null);
	const socketRef = useRef(null);
	const retry = useRef(0);
	const lobbyRoute = '/api/lobby';
	const authRoute = '/api/auth';

	const { user, logout } = useAuth();

	useEffect(() => {
		console.log('LobbyContext useEffect - user:', user, 'socket:', socketRef.current);
		if (user && !socketRef.current) {
			connect();
		}
		if (!user && socketRef.current) {
			console.log("Disconnecting lobby socket !");
			socketRef.current.disconnect();
			socketRef.current = null;
			setLobbyStruct(null);
			setLobbyId(null);
			setGameId(null);
		}
	}, [user]);

	const connect = (onConnected, onConnectionError, onLobbyCreated, onLobbyJoined) => {
		if (socketRef.current)
			return;

		socketRef.current = io({
			path: `${lobbyRoute}/socket.io`,
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

		socketRef.current.on('lobby:rulesChanged', ({ lobbyStruct }) => {
			setLobbyStruct(lobbyStruct)
		});

		socketRef.current.on('lobby:readyChanged', (struct) => {
			setLobbyStruct(struct.lobbyStruct);
		});

		socketRef.current.on('lobby:userLeft', ({ userId }) => {
			setLobbyStruct(prev => {
				if (!prev)
					return null;
				return {...prev,
				users: prev.users.filter(u => u.id !== userId)
				};
			});
		});

		socketRef.current.on('lobby:disconnected', ({ userId }) => {
			setLobbyStruct(prev => {
				if (!prev)
					return null;
				return {...prev,
				users: prev.users.filter(u => u.id !== userId)
				};
			});
		});

		socketRef.current.on('lobby:gameStarting', ({ gameId }) => {
			setGameId(gameId);
		});

		socketRef.current.on('connect', () => {
			setConnected(true);
			if(onConnected)
				onConnected();
		});

		socketRef.current.on('connect_error', async (err) => {
			logError('LobbySocket', 'connection failed', err.message);
			socketRef.current.disconnect();
			socketRef.current = null;

			if (retry.current >= 1) {
				retry.current = 0;
				logout();
				return;
			}
			retry.current++;
			try {
				const res = await fetch(`${authRoute}/refresh`, {
          	  		method: 'POST',
           			credentials: 'include',
            		headers: { 'Content-Type': 'application/json' }
        		});
				if (res.ok) {
					connect();
				} else {
					logError('LobbySocket', 'connect_error — refresh rejected', { status: res.status });
					logout();
				}
			} catch (e) {
				logError('LobbySocket', 'connect_error — refresh network error', e);
				logout();
			}
			// if (onConnectionError)
			// 	onConnectionError(err.message);
		});

		socketRef.current.on('error', (message) => {
			setLobbyError(message);
			if (message === "Trying to connect from an another device !") {
				socketRef.current = null;
				logout();
			}
		});
	}

	const createLobby = (gameMode, gameType, maxUsers) => {
		socketRef.current.emit('lobby:create', { gameMode, gameType, maxUsers });
	};

	const updateRules = (lobbyId, rules) => {
		socketRef.current.emit('lobby:updateRules', { lobbyId, ...rules })
	}

	const joinLobby = (lobbyId) => {
		socketRef.current.emit('lobby:join', { lobbyId });
	};

	const leaveLobby = () => {
		if (socketRef.current)
			socketRef.current.emit('lobby:leave');
		setLobbyId(null);
		setLobbyStruct(null);
		setGameId(null);
	};

	const joinMatchmaking = (gameMode, gameType, maxUsers) => {
		socketRef.current.emit('matchmaking:join', { gameMode, gameType, maxUsers });
		setMatchmakingStatus('searching');
	};

	const leaveMatchmaking = () => {
		socketRef.current.emit('matchmaking:leave');
		setMatchmakingStatus(null);
	};

	const toggleReady = (lobbyId) => {
		socketRef.current.emit('lobby:ready', { lobbyId });
	};
	
	const startGame = (lobbyId) => {
		socketRef.current.emit('lobby:start', { lobbyId });
	};

	const value = {
		lobbyStruct,
		lobbyError,
		setLobbyError,
		connected,
		lobbyId,
		connect,
		createLobby,
		joinLobby,
		leaveLobby,
		updateRules,
		joinMatchmaking,
		leaveMatchmaking,
		toggleReady,
		startGame,
		matchmakingStatus,
		gameId
	};

	return (
		<LobbyContext.Provider value={value}>
			{children}
		</LobbyContext.Provider>
	);
}
