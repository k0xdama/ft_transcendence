import { createContext, useContext, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const GameContext = createContext(null);

export function useGame() {
	return useContext(GameContext);
};

export function GameProvider({ children }) {
	const { refreshToken } = useAuth();
	const [gameStruct, setGameStruct] = useState(null);
	const [gameError, setGameError] = useState(null);
	const [pendingCheck, setPendingCheck] = useState(false);
	const [lastAction, setLastAction] = useState(null);
	const [turnTimer, setTurnTimer] = useState(false);
	const [disconnectedPlayer, setDisconnectedPlayer] = useState(null);
	const [revealedHandCards, setRevealedHandCards] = useState([]);
	const [gameResult, setGameResult] = useState(null);
	const [riverSlots, setRiverSlot] = useState(null);
	const socketRef = useRef(null);
	const retryRef = useRef(0);
	const gameRoute = '/api/game';

	const updateRiverSlot = (slots) => {
		setRiverSlot(slots);
	};

	const hydrateRiverSlots = (slots, cardsInMiddle) => {
		if (!Array.isArray(slots))
			return [];
		const cardsById = new Map((cardsInMiddle || []).map(card => [card.id, card]));
		return slots.map(slot => {
			if (!slot)
				return null;
			return cardsById.get(slot.id) || slot;
		});
	};

	const connect = (gameId, onConnected, onError) => {
		if (socketRef.current)
			return;

		socketRef.current = io({
			path: `${gameRoute}/socket.io`,
			withCredentials: true,
			transports: ['websocket'],
			reconnection: false
		});

		socketRef.current.on('connect', () => {
			retryRef.current = 0;
			socketRef.current.emit('game:join', { gameId });
			if (onConnected)
				onConnected();
		});

		socketRef.current.on('game:started', ({ gameStruct }) => {
			setGameStruct(gameStruct);
			updateRiverSlot(hydrateRiverSlots(gameStruct.riverSlots, gameStruct.cardsInMiddle));
		});

		socketRef.current.on('game:update', ({ gameStruct, action_result }) => {
			setGameStruct(gameStruct);
			setLastAction(action_result);
			updateRiverSlot(hydrateRiverSlots(gameStruct.riverSlots, gameStruct.cardsInMiddle));
			if (action_result?.actionDone !== 'FLIP_MIDDLE' && action_result?.revealedCard) {
				setRevealedHandCards(prev => [...prev, {
					cardId: action_result.revealedCard.id,
					ownerId: action_result.target,
					value: action_result.revealedCard.value
				}]);
			}
			if (action_result?.turnEnded) {
				setPendingCheck(true);
				setTurnTimer(true);
			}
		})

		socketRef.current.on('game:turnChanged', ({ gameStruct }) => {
			setGameStruct(gameStruct);
			updateRiverSlot(hydrateRiverSlots(gameStruct.riverSlots, gameStruct.cardsInMiddle));
			setLastAction(null);
			setPendingCheck(false);
			setTurnTimer(false);
			setRevealedHandCards([]);
		})

		socketRef.current.on('game:ended', (result) => {
			setGameResult(result);
		})

		socketRef.current.on('game:playerDisconnected', ({ userId }) => {
			setDisconnectedPlayer({ userId, duration: 30 });
		})

		socketRef.current.on('game:playerReconnected', ({ userId }) => {
			setDisconnectedPlayer(null);
		})

		socketRef.current.on('game:playerEliminated', ({ userId }) => {
			setDisconnectedPlayer(null);
		})

		socketRef.current.on('game:reconnected', ({ gameStruct, riverSlots: receivedRiverSlots }) => {
			setGameStruct(gameStruct);
			updateRiverSlot(hydrateRiverSlots(receivedRiverSlots, gameStruct.cardsInMiddle));
		});

		socketRef.current.on('error', (message) => {
			setGameError(message);
		})

		socketRef.current.on('connect_error', async (err) => {
			console.error('[GAME-WS] Connection error:', err.message);
			socketRef.current.disconnect();
			socketRef.current = null;

			if (retryRef.current >= 1) {
				retryRef.current = 0;
				if (onError)
					onError(err.message);
				return;
			}
			retryRef.current++;
			const refreshed = await refreshToken();
			if (refreshed)
				connect(gameId, onConnected, onError);
			else if (onError)
				onError('Authentication failed');
		})
	}

	const disconnect = () => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
		}
		setGameStruct(null);
		setGameResult(null);
		setPendingCheck(false);
		setLastAction(null);
		setTurnTimer(false);
		setDisconnectedPlayer(null);
		setRevealedHandCards([]);
		setRiverSlot(null);
	};

	const sendAction = (gameId, actionType, target = null) => {
		if (!socketRef.current)
			return;
		socketRef.current.emit('game:action', { gameId, actionType, target })
	};

	const sendCheck = (gameId) => {
		if (!socketRef.current)
			return;
		socketRef.current.emit('game:check', { gameId })
	};

	const value = {
		gameStruct,
		gameError,
		gameResult,
		connect,
		disconnect,
		sendAction,
		sendCheck,
		turnTimer,
		disconnectedPlayer,
		pendingCheck,
		lastAction,
		revealedHandCards,
		riverSlots
	};

	return (
		<GameContext.Provider value={value}>
			{children}
		</GameContext.Provider>
	);
}
