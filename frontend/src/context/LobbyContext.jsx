import { createContext, useContext, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const LobbyContext = createContext(null)

export function useLobby() {
	return useContext(LobbyContext)
}


export function LobbyProvider({ children }) {
	const [lobbyStruct, setLobbyStruct] = useState(null)
	const socketRef = useRef(null)
	const { user } = useAuth()

	const connect = (token) => {
		if (socketRef.current) return

		socketRef.current = io('http://localhost:4000/api/lobby', {
			auth: { token }
		})

		socketRef.current.on('lobby:created', ({ lobbyId }) => {
			console.log('Lobby created: ', lobbyId)
		})

		socketRef.current.on('lobby:joined', (struct) => {
			setLobbyStruct(struct)
		})

		socketRef.current.on('lobby:readyChanged', (struct) => {
			setLobbyStruct(struct)
		})

		socketRef.current.on('lobby:disconnected', ({ userId }) => {
			setLobbyStruct(prev => ({
				...prev,
				users: prev.users.filter(u => u.id !== userId)
			}))
		})

		socketRef.current.on('lobby:gameStarting', ({ gameId }) => {
			console.log('Game created: ', gameId)
		})

		socketRef.current.on('lobby:error', (message) => {
			console.error('Lobby error: ', message)
		})
	}

	const createLobby = (gameMode, gameType, maxUsers) => {
		socketRef.current.emit('lobby:create', { gameMode, gameType, maxUsers })
	}

	const joinLobby = (lobbyId) => {
		socketRef.current.emit('lobby:joined', { lobbyId })
	}

	const toggleReady = (lobbyId) => {
		socketRef.current.emit('lobby:ready', { lobbyId })
	}
	
	const startGame = (lobbyId) => {
		socketRef.current.emit('lobby:start', { lobbyId })
	}

	return (
		<LobbyContext.Provider value={{
			lobbyStruct,
			connect,
			createLobby,
			joinLobby,
			toggleReady,
			startGame,
		}}>
			{children}
		</LobbyContext.Provider>
	)
}
