import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useIsMobileGame } from "../../hooks/useIsMobileGame";
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
	const chatRoute = '/api/chat'

	// Fetch history separately — runs once when the room/user changes
	useEffect(() => {
		if (!user || !lobbyId)
			return

		const fetchHistory = async () => {
			try {
				const res = await authFetch(`${chatRoute}/room/${lobbyId}/history`)
				if (!res || !res.ok)
					return

				const data = await res.json()
				setMessages(data.reverse().map(msg => mapMessage(user.id, msg)))
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
			setMessages(prev => [...prev, mapMessage(user.id, msg)])
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
			await authFetch(`${chatRoute}/room/send`, {
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
			<div className="min-h-0 flex flex-1 flex-col items-start gap-[0.2rem] overflow-y-auto px-3 py-2 text-[0.8rem] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar]:w-1">
				{messages.map(msg => <ChatMessage key={msg.id} msg={msg} onNavigate={navigate} />)}
				<div ref={bottomRef} />
			</div>

			{typingUsers.length > 0 && (
				<p className="m-0 shrink-0 px-3 py-[0.2rem] text-left text-[0.7rem] italic text-white/45">
					{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
				</p>
			)}

			<div className="shrink-0 flex gap-[0.35rem] overflow-x-auto border-t border-white/[0.08] px-[0.6rem] py-[0.3rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{QUICK_REPLIES.map(text => (
					<button
						key={text}
						className="shrink-0 rounded-full border border-white/20 bg-transparent px-[0.6rem] py-[0.2rem] text-center font-sans text-[0.72rem] text-white/75 transition-colors duration-150 hover:border-[#9d4edd] hover:bg-[rgba(157,78,221,0.15)] hover:text-white"
						onClick={() => sendQuickReply(text)}
					>
						{text}
					</button>
				))}
			</div>

			<div className="shrink-0 flex border-t border-white/10">
				<input
					className="flex-1 border-none bg-transparent px-[0.6rem] py-[0.4rem] font-sans text-[0.8rem] text-white outline-none placeholder:text-white/35"
					value={draft}
					onChange={e => { setDraft(e.target.value); handleTyping(e.target.value) }}
					onKeyDown={handleKey}
					placeholder="Type a message..."
				/>
				<button className="cursor-pointer rounded-none border-none border-l border-white/10 bg-transparent px-[0.6rem] py-[0.4rem] text-base text-[#9d4edd] hover:border-transparent hover:bg-white/5" onClick={sendMessage}>Send</button>
			</div>
		</>
	)

	if (isMobile) {
		return (
			<>
				{/* Mobile: toggle button */}
				<button
					className={`absolute bottom-[2vh] left-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-purple-mid bg-[rgba(10,5,20,0.9)] text-[1rem] text-purple-pale shadow-card transition-all hover:bg-[rgba(20,10,40,0.95)] ${mobileOpen ? 'hidden' : ''}`}
					onClick={() => setMobileOpen(true)}
					aria-label="Open chat"
				>
					💬
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</button>

				{/* Mobile: fullscreen chat overlay */}
				{mobileOpen && (
					<div className="fixed inset-0 z-[150] flex flex-col bg-[rgba(10,5,20,0.95)] backdrop-blur-md">
						<div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2">
							<span className="text-[0.75rem] uppercase tracking-ui text-purple-pale/70">Game Chat</span>
							<button
								className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xs text-white/80"
								onClick={() => setMobileOpen(false)}
								aria-label="Close chat"
							>
								✕
							</button>
						</div>
						{chatContent}
					</div>
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

function mapMessage(userId, msg) {
	return {
		id: msg.id,
		senderId: msg.sender_id,
		author: msg.sender_id === userId
			? 'You'
			: msg.username,
		text: msg.content,
		type: msg.message_type
	}
}

export default ChatOverlay
