import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { logError } from '../utils/logger.js';
import { useChat } from './ChatContext';

const DMContext = createContext(null);

export function useDM() {
	return useContext(DMContext);
}

export function DMProvider({ children }) {
	const { user, authFetch } = useAuth();
	const { on } = useChat();
	const chatRoute = '/api/chat';

	const [conversations, setConversations] = useState([]);
	const [openChats, setOpenChats] = useState([]);
	const [listOpen, setListOpen] = useState(false);

	const totalUnread = conversations.reduce((sum, c) => sum + Number(c.unread_count || 0), 0);

	const fetchConversations = useCallback(async () => {
		if (!user)
			return;

		try {
			const res = await authFetch(`${chatRoute}/dm`);
			if (res?.ok) {
				const data = await res.json();
				setConversations(data);
			} else {
				logError('DM', 'fetchConversations failed', { status: res?.status });
			}
		} catch (err) {
			logError('DM', 'fetchConversations — network error', err);
		}
	}, [user, authFetch]);

	// Fetch on mount
	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	// Listen for incoming DM messages in real-time
	useEffect(() => {
		if (!on || !user)
			return;

		return on('dm:message', (msg) => {
			// Update conversation list: bump unread count and last message
			setConversations(prev => {
				const idx = prev.findIndex(c => c.id === msg.conversation_id);
				if (idx === -1) {
					// New conversation — refetch the full list
					fetchConversations();
					return prev;
				}

				const updated = [...prev];

				updated[idx] = {
					...updated[idx],
					last_message: msg.content,
					last_sender_id: msg.sender_id,
					last_message_at: msg.created_at,
					unread_count: msg.sender_id !== user.id
						? Number(updated[idx].unread_count || 0) + 1
						: updated[idx].unread_count
				};

				// Move to top
				const [conv] = updated.splice(idx, 1);
				updated.unshift(conv);

				return updated;
			})
		})
	}, [on, user, fetchConversations])

	useEffect(() => {
		if (!on || !user)
			return;

		return on('dm:read', ({ conversationId, readBy }) => {
			if (readBy !== user.id)
				return;

			setConversations(prev => prev.map(c =>
				c.id === conversationId
					? { ...c, unread_count: 0 }
					: c
			));
		})
	}, [on, user]);

	// Open a DM chat window (create conversation if needed)
	const openDM = useCallback(async (targetId, targetUsername, targetAvatar) => {
		if (!user)
			return;

		// Check if already open
		const existing = openChats.find(c => {
			const otherId = c.userId;
			return otherId === targetId;
		});
		if (existing) {
			// Un-minimize if minimized
			setOpenChats(prev => prev.map(c =>
				c.conversationId === existing.conversationId
					? { ...c, minimized: false }
					: c
			))
			return;
		}

		try {
			// Create or get conversation
			const res = await authFetch(`${chatRoute}/dm`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetId })
			});
			if (!res?.ok) {
				logError('DM', 'openDM failed', { status: res?.status });
				return;
			}

			const conversation = await res.json();

			setOpenChats(prev => {
				// Max 3 open windows
				const next = prev.length >= 3 ? prev.slice(1) : [...prev];

				return [...next, {
					conversationId: conversation.id,
					userId: targetId,
					username: targetUsername,
					avatar: targetAvatar,
					minimized: false
				}];
			})

			// Refresh conversation list
			fetchConversations()
		} catch (err) {
			logError('DM', 'openDM — network error', err)
		}
	}, [user, openChats, authFetch, fetchConversations])

	const closeDM = useCallback((conversationId) => {
		setOpenChats(prev => prev.filter(c => c.conversationId !== conversationId))
	}, []);

	const toggleMinimize = useCallback((conversationId) => {
		setOpenChats(prev => prev.map(c =>
			c.conversationId === conversationId ? { ...c, minimized: !c.minimized } : c
		))
	}, []);

	const value = {
		conversations,
		openChats,
		listOpen,
		setListOpen,
		totalUnread,
		openDM,
		closeDM,
		toggleMinimize,
		fetchConversations
	};

	return (
		<DMContext.Provider value={value}>
			{children}
		</DMContext.Provider>
	);
}
