import { createContext, useContext, useState, useRef } from "react"
import { io } from "socket.io-client"

const MatchmakingContext = createContext(null)

export function useMatchmaking() {
	return useContext(MatchmakingContext)
}

export function MatchmakingProvider({ children }) {
	const [gameId, setGameId] = useState(null)
	const [error, setError] = useState(null)
	const socketRef = useRef(null);

	const connect = (onConnected, onConnectionError) => {
		if (socketRef.current)
			return;

		socketRef.current = io({
			path: '/api/lobby/socket.io',
			withCredentials: true,
			transports: ['websocket'],
			reconnection: false
		});

		socketRef.current.on('connect', () => {
			if (onConnected)
				onConnected();
		});

		socketRef.current.on('connect_error', (err) => {
			console.error('Matchmaking connection failed:', err.message);
			socketRef.current = null;
			if (onConnectionError)
				onConnectionError(err.message);
		});

		socketRef.current.on('lobby:gameStarting', ({ gameId }) => {
			setGameId(gameId);
		});

		socketRef.current.on('error', (message) => {
			setError(message);
		});
	}

	const joinMatchmaking = (gameMode, gameType, maxUsers) => {
		socketRef.current.emit('matchmaking:join', { gameMode, gameType, maxUsers });
	};

	const leaveMatchmaking = () => {
		if (socketRef.current) {
			socketRef.current.emit('matchmaking:leave');
			socketRef.current.disconnect();
			socketRef.current = null;
		}
		setGameId(null);
		setError(null);
	};

	return (
		<MatchmakingContext.Provider value={{
			gameId,
			error,
			setError,
			connect,
			joinMatchmaking,
			leaveMatchmaking
		}}>
			{children}
		</MatchmakingContext.Provider>
	);
}
