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
	const	[turnTimer, setTurnTimer] = useState(false)
	const	[disconnectedPlayer, setDisconnectedPlayer] = useState(null)
	const	[revealedHandCards, setRevealedHandCards] = useState([])
	const	[gameResult, setGameResult] = useState(null)
	const	socketRef = useRef(null)
	const	riverSlotsRef = useRef(null)

	const	connect = (gameId, onConnected, onError) => {
		if (socketRef.current)
			return

		socketRef.current = io({
			path: '/api/game/socket.io',
			withCredentials: true,
			transports: ['websocket'],
			reconnection: false
		})

		socketRef.current.on('connect', () => {
			socketRef.current.emit('game:join', { gameId })
			if (onConnected)
				onConnected()
		})

		socketRef.current.on('game:started', ({ gameStruct }) => {
			setGameStruct(gameStruct)
			riverSlotsRef.current = gameStruct.cardsInMiddle.map(card => ({...card}))
		})

		socketRef.current.on('game:update', ({ gameStruct, action_result }) => {
			setGameStruct(gameStruct)
			setLastAction(action_result)
			if (riverSlotsRef.current) {
				const activeIds = new Set(gameStruct.cardsInMiddle.map(c => c.id))
				riverSlotsRef.current = riverSlotsRef.current.map(slot => slot && activeIds.has(slot.id) ? slot : null)
			}
			if (action_result?.actionDone !== 'FLIP_MIDDLE' && action_result?.revealedCard) {
				setRevealedHandCards(prev => [...prev, {
					cardId: action_result.revealedCard.id,
					ownerId: action_result.target,
					value: action_result.revealedCard.value
				}])
			}
			if (action_result?.turnEnded) {
				setPendingCheck(true)
				setTurnTimer(true)
			}
		})

		socketRef.current.on('game:turnChanged', ({ gameStruct }) => {
			setGameStruct(gameStruct)
			setLastAction(null)
			setPendingCheck(false)
			setTurnTimer(false)
			setRevealedHandCards([])
		})

		socketRef.current.on('game:ended', (result) => {
			setGameResult(result)
		})

		socketRef.current.on('game:playerDisconnected', ({ userId }) => {
			setDisconnectedPlayer({ userId, duration: 30 })
		})

		socketRef.current.on('game:playerReconnected', ({ userId }) => {
			setDisconnectedPlayer(null)
		})

		socketRef.current.on('game:playerEliminated', ({ userId }) => {
			setDisconnectedPlayer(null)
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
		gameResult,
		connect,
		sendAction,
		sendCheck,
		turnTimer,
		disconnectedPlayer,
		pendingCheck,
		lastAction,
		revealedHandCards,
		riverSlots: riverSlotsRef.current
	}
	return (
		<GameContext.Provider value={value}>
			{children}
		</GameContext.Provider>
	)
}
