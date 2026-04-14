import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useIsMobileGame } from "../../hooks/useIsMobileGame";
import {
	CHAT_ROUTE,
	ChatInputBar,
	MessagesScroll,
	MobileChatFab,
	MobileChatPanel,
	MobilePanelHeader,
	QuickReplyBar,
	TypingLine,
	mapChatMessage,
} from "../chat/ChatUI";
import { IconChat } from "../icons/Icons";
import { SOUNDS } from "./SoundBuzzers";

const TYPING_TIMEOUT_MS = 1000;

const QUICK_REPLIES = [ 'GG', 'MB', 'Nice move!', 'Ezzz' ];

const NEON_COLORS = ['#00dcff', '#ff00ff', '#39ff14', '#FFD700', '#ff6b35', '#ff0066', '#00ff9f'];

function getAuthorColor(author) {
	if (author === 'You')
		return '#7B2FFF';
	let hash = 0;
	for (let i = 0; i < author.length; i++)
		hash = (hash * 31 + author.charCodeAt(i)) & 0xffffffff;
	return NEON_COLORS[Math.abs(hash) % NEON_COLORS.length];
}

function ChatOverlay({ lobbyId }) {
	const isMobile = useIsMobileGame()
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState("")
	const [typingUsers, setTypingUsers] = useState([])
	const [mobileOpen, setMobileOpen] = useState(false)
	const [unreadCount, setUnreadCount] = useState(0)
	const mobileOpenRef = useRef(false)
	const bottomRef = useRef(null)
	const typingTimers = useRef({})
	const typingDebounce = useRef(null)
	const { authFetch, user } = useAuth()
	const { connected, on, emit } = useChat()
	const navigate = useNavigate()

	// Fetch history separately — runs once when the room/user changes
	useEffect(() => {
		if (!user || !lobbyId)
			return

		const fetchHistory = async () => {
			try {
				const res = await authFetch(`${CHAT_ROUTE}/room/${lobbyId}/history`)
				if (!res || !res.ok)
					return

				const data = await res.json()
				setMessages(data.reverse().map(msg => mapChatMessage(user.id, msg)))
			} catch (err) {
				console.error('Failed to fetch chat history:', err)
			}
		}
		fetchHistory()
	}, [lobbyId, user])

	// Wire chat events through the shared ChatContext socket
	// Wait until 'connected' so the 'chat:join' emit isn't dropped
	useEffect(() => {
		if (!user || !lobbyId || !connected)
			return

		emit('chat:join', { lobbyId })

		const offMessage = on('chat:message', (msg) => {
			setMessages(prev => [...prev, mapChatMessage(user.id, msg)])
			if (msg.sender_id !== user.id && !mobileOpenRef.current)
				setUnreadCount(prev => prev + 1)
		})

		const offTyping = on('chat:typing', ({ username }) => {
			setTypingUsers(prev => [...new Set([...prev, username])])
			clearTimeout(typingTimers.current[username])
			typingTimers.current[username] = setTimeout(() => {
				setTypingUsers(prev => prev.filter(u => u !== username))
			}, TYPING_TIMEOUT_MS)
		})

		const offSound = on('chat:sound', ({ sound }) => {
			const src = SOUNDS[sound]
			if (src)
				new Audio(src).play().catch(() => {})
		})

		const offNotif = on('chat:notification', (notif) => {
			setMessages(prev => [...prev, {
				id: `notif-${Date.now()}`,
				author: 'System',
				text: notif.message || (notif.type === 'game_ended' ? 'The game has ended!' : notif.type),
				type: 'notification'
			}])
		})

		return () => {
			offMessage()
			offTyping()
			offSound()
			offNotif()
		}
	}, [lobbyId, user, connected, on, emit])

	// Keep ref in sync for use inside socket callbacks
	useEffect(() => {
		mobileOpenRef.current = mobileOpen
		if (mobileOpen)
			setUnreadCount(0)
	}, [mobileOpen])

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const postMessage = async (content, messageType) => {
		try {
			await authFetch(`${CHAT_ROUTE}/room/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lobbyId, content, messageType })
			})
		} catch (err) {
			console.error('Failed to send message:', err)
		}
	}

	const sendMessage = async () => {
		if (!draft.trim())
			return
		const content = draft
		setDraft("")
		await postMessage(content, 'user_text')
	}

	const sendQuickReply = (text) => postMessage(text, 'quick_reply')

	const handleTyping = (value) => {
		if (!value.trim())
			return
		clearTimeout(typingDebounce.current)
		typingDebounce.current = setTimeout(() => { emit('chat:typing', { lobbyId })}, 100)
	}

	const handleKey = (e) => {
		if (e.key === "Enter")
			sendMessage()
	}

	const chatContent = (
		<>
			<MessagesScroll bottomRef={bottomRef}>
				{messages.map(msg => <ChatMessage key={msg.id} msg={msg} onNavigate={navigate} />)}
			</MessagesScroll>

			<TypingLine users={typingUsers} />

			<QuickReplyBar replies={QUICK_REPLIES} onSelect={sendQuickReply} />

			<ChatInputBar
				value={draft}
				onChange={e => { setDraft(e.target.value); handleTyping(e.target.value) }}
				onKeyDown={handleKey}
				onSend={sendMessage}
			/>
		</>
	)

	if (isMobile) {
		return (
			<>
				<MobileChatFab
					icon={<IconChat />}
					unread={unreadCount}
					onClick={() => setMobileOpen(true)}
					hidden={mobileOpen}
					ariaLabel="Open chat"
					positionClassName="absolute bottom-[0.5vh] left-3"
					sizeClassName="h-9 w-9 text-[1rem]"
				/>

				{mobileOpen && (
					<MobileChatPanel>
						<MobilePanelHeader
							title="Game Chat"
							onClose={() => setMobileOpen(false)}
							ariaLabelClose="Close chat"
						/>
						{chatContent}
					</MobileChatPanel>
				)}
			</>
		)
	}

	return (
		<div className="absolute bottom-12 left-4 z-10 flex max-h-[220px] w-[280px] flex-col overflow-hidden rounded-lg bg-black/10 transition-colors duration-300 hover:bg-black/55">
			{chatContent}
		</div>
	)
}

function ChatMessage({ msg, onNavigate }) {
	if (msg.type === 'notification')
		return (
			<div className="w-full shrink-0 break-words text-left leading-[1.4]">
				<span className="font-sans text-white/90">{msg.text}</span>
			</div>
		)

	return (
		<div className="w-full shrink-0 break-words text-left leading-[1.4]">
			<span
				className={`font-bold ${msg.author !== 'You' ? 'cursor-pointer hover:underline' : ''}`}
				style={{ color: getAuthorColor(msg.author) }}
				onClick={() => msg.author !== 'You' && onNavigate(`/profile/${msg.senderId}`)}
			>
				{msg.author}:
			</span>
			<span className="font-sans text-white/90">{msg.text}</span>
		</div>
	)
}

export default ChatOverlay
