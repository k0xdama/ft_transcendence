import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function useChat() {
	return useContext(ChatContext);
}

export function ChatProvider({ children }) {
	const [connected, setConnected] = useState(false);
	const socketRef = useRef(null);
	const chatRoute = '/api/chat';

	const { user } = useAuth();

	useEffect(() => {
		if (user && !socketRef.current) {
			const socket = io({
				path: `${chatRoute}/socket.io`,
				withCredentials: true,
				transports: ['websocket']
			});

			socket.on('connect', () => setConnected(true));
			socket.on('disconnect', () => setConnected(false));

			socketRef.current = socket;
		}
		if (!user && socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
			setConnected(false);
		}
	}, [user]);

	const on = useCallback((event, handler) => {
		socketRef.current?.on(event, handler);
		return () => {
			socketRef.current?.off(event, handler);
		};
	}, [connected]);

	const emit = useCallback((event, payload) => {
		socketRef.current?.emit(event, payload);
	}, []);

	const value = {
		connected,
		on,
		emit
	};

	return (
		<ChatContext.Provider value={value}>
			{children}
		</ChatContext.Provider>
	);
}
