import { createContext, useContext, useState, useRef } from "react";
import { io } from "socket.io-client"

const GameContext = createContext(null)

export function useGame() {
	return useContext(GameContext)
}

export function GameProvider({ children }) {
	const	[gameStruct, setGameStruct] = useState(null)
	const	[gameError, setGameError] = useState(null)
	const	[pendingCheck, setPendingCheck] = useState(false)
	const	[lastAction, setLastAction] = useState(null)
	const	socketRef = useRef(null)

	const	connect = (token, gameId, onConnected, onError) => {
		if (socketRef.current) return

		socketRef.current = io('http://localhost:4000', {
			path: '/api/game/socket.io',
			auth: { token },
			transports: ['websocket'],
			reconnection: false
		})

		socketRef.current.on('connect', () => {
			socketRef.current.emit('game:join', { gameId })
			if (onConnected) onConnected()
		})

		socketRef.current.on('game:started', ({ gameStruct }) => {
			setGameStruct(gameStruct)
		})

		socketRef.current.on('game:update', ({ gameStruct, action_result }) => {
			setGameStruct(gameStruct)
			setLastAction(action_result)
			if (action_result?.turnEnded) setPendingCheck(true)
		})

		socketRef.current.on('game:turnChanged', ({ gameStruct }) => {
			setGameStruct(gameStruct)
			setLastAction(null)
			setPendingCheck(false)
		})

		socketRef.current.on('game:reconnected', ({ gameStruct }) => {
			setGameStruct(gameStruct)
		})

		socketRef.current.on('error', (message) => {
			setGameError(message)
		})

		socketRef.current.on('connection_error', (err) => {
			socketRef.current = null
			if (onError) onError(err.message)
		})
	}

	const	sendAction = (gameId, actionType, target = null) => {
		socketRef.current.emit('game:action', { gameId, actionType, target })
	}

	const	sendCheck = (gameId) => {
		socketRef.current.emit('game:check', { gameId })
	}

	const	value = {
		gameStruct,
		gameError,
		connect,
		sendAction,
		sendCheck,
		pendingCheck,
		lastAction
	}
	return (
		<GameContext.Provider value={value}>
			{children}
		</GameContext.Provider>
	)
}
