import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useDM } from '../../context/DMContext'
import PFP_Default from '../../assets/PFP_Default.webp'

const playerRoute = '/api/players'
const chatRoute = '/api/chat'

// ─── Main Overlay (bottom-right corner) ─────────────────────────────────────
function DMChatOverlay() {
	const { user } = useAuth()
	const { conversations, openChats, listOpen, setListOpen, totalUnread, openDM, closeDM, toggleMinimize } = useDM()

	if (!user)
		return null

	return (
		<>
			{/* Desktop layout: bottom-right with chat windows */}
			<div className="fixed bottom-10 right-0 z-50 hidden items-end gap-2 p-4 pointer-events-none md:flex">
				{/* Open chat windows */}
				{openChats.map(chat => (
					<DMChatWindow
						key={chat.conversationId}
						chat={chat}
						onClose={() => closeDM(chat.conversationId)}
						onMinimize={() => toggleMinimize(chat.conversationId)}
					/>
				))}

				{/* Conversations list */}
				{listOpen && (
					<DMConversationList
						conversations={conversations}
						user={user}
						onSelect={(conv) => {
							const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
							const avatar = conv.other_avatar && conv.other_avatar !== '/uploads/profilePictures/default_profile_picture.png'
								? `${playerRoute}/${otherId}/profile-picture`
								: null
							openDM(otherId, conv.other_username, avatar)
						}}
						onClose={() => setListOpen(false)}
					/>
				)}

				{/* Toggle button */}
				<button
					className="pointer-events-auto relative flex h-14 w-14 items-center justify-center bg-transparent border-none cursor-pointer transition-transform hover:scale-110 mr-4"
					onClick={() => setListOpen(prev => !prev)}
					title="Messages"
					style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 16px rgba(255,255,255,0.5))' }}
				>
					<span className="text-[2.25rem] leading-none">✉️</span>
					{totalUnread > 0 && (
						<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
							{totalUnread > 99 ? '99+' : totalUnread}
						</span>
					)}
				</button>
			</div>

			{/* Mobile: toggle button — same level & size as lobby chat icon */}
			<button
				className={`md:hidden fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-purple-mid bg-[rgba(10,5,20,0.9)] text-xl text-purple-pale shadow-card transition-all hover:bg-[rgba(20,10,40,0.95)] ${listOpen ? 'hidden' : ''}`}
				onClick={() => setListOpen(prev => !prev)}
				aria-label="Messages"
			>
				✉️
				{totalUnread > 0 && (
					<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
						{totalUnread > 99 ? '99+' : totalUnread}
					</span>
				)}
			</button>

			{/* Mobile: fullscreen conversation list */}
			{listOpen && (
				<div className="md:hidden fixed inset-0 z-[150] flex flex-col bg-[rgba(10,5,20,0.95)] backdrop-blur-md">
					<div className="flex items-center justify-between border-b border-purple-dim px-4 py-3">
						<h3 className="m-0 text-xs font-semibold uppercase tracking-ui text-purple-pale">Messages</h3>
						<button
							className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xs text-white/80"
							onClick={() => setListOpen(false)}
							aria-label="Close messages"
						>
							✕
						</button>
					</div>
					<div className="flex-1 overflow-y-auto">
						{conversations.length === 0 ? (
							<p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-8 m-0">No conversations yet</p>
						) : (
							conversations.map(conv => (
								<button
									key={conv.id}
									className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer border-0 bg-transparent"
									onClick={() => {
										const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
										const avatar = conv.other_avatar && conv.other_avatar !== '/uploads/profilePictures/default_profile_picture.png'
											? `${playerRoute}/${otherId}/profile-picture`
											: null
										openDM(otherId, conv.other_username, avatar)
										setListOpen(false)
									}}
								>
									<img
										className="h-9 w-9 rounded-full border-2 border-purple-brand/30 object-cover flex-shrink-0"
										src={conv.other_avatar && conv.other_avatar !== '/uploads/profilePictures/default_profile_picture.png'
											? `${playerRoute}/${conv.user1_id === user.id ? conv.user2_id : conv.user1_id}/profile-picture`
											: PFP_Default}
										alt={conv.other_username}
										onError={e => { e.target.src = PFP_Default }}
									/>
									<div className="flex flex-col gap-0.5 flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<span className="text-sm font-bold uppercase tracking-wider text-purple-pale truncate">{conv.other_username}</span>
											{Number(conv.unread_count) > 0 && (
												<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-brand px-1 text-[0.6rem] font-bold text-white flex-shrink-0 ml-2">
													{conv.unread_count}
												</span>
											)}
										</div>
										{conv.last_message && (
											<span className="text-xs text-white/40 truncate">{conv.last_message}</span>
										)}
									</div>
								</button>
							))
						)}
					</div>
				</div>
			)}

			{/* Mobile: open DM chat windows as fullscreen */}
			{openChats.filter(c => !c.minimized).map(chat => (
				<div key={chat.conversationId} className="md:hidden fixed inset-0 z-[160] flex flex-col bg-[rgba(10,5,20,0.95)] backdrop-blur-md">
					<DMChatWindow
						chat={{ ...chat, minimized: false }}
						onClose={() => closeDM(chat.conversationId)}
						onMinimize={() => toggleMinimize(chat.conversationId)}
						mobile
					/>
				</div>
			))}
		</>
	)
}

// ─── Conversation List Panel ────────────────────────────────────────────────
function DMConversationList({ conversations, onSelect, onClose, user }) {
	return (
		<div className="pointer-events-auto flex w-[calc(100vw-2rem)] flex-col rounded-xl border border-purple-mid bg-card backdrop-blur-3xl shadow-card max-h-[70vh] md:w-72 md:max-h-[420px]">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-purple-dim px-4 py-3">
				<h3 className="m-0 text-xs font-semibold uppercase tracking-ui text-purple-pale">Messages</h3>
				<button
					className="flex h-6 w-6 items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
					onClick={onClose}
				>
					&#10005;
				</button>
			</div>

			{/* Conversations */}
			<div className="flex-1 overflow-y-auto min-h-0 [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
				{conversations.length === 0 ? (
					<p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-8 m-0">No conversations yet</p>
				) : (
					conversations.map(conv => (
						<button
							key={conv.id}
							className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer border-0 bg-transparent"
							onClick={() => onSelect(conv)}
						>
							<img
								className="h-9 w-9 rounded-full border-2 border-purple-brand/30 object-cover flex-shrink-0"
								src={conv.other_avatar && conv.other_avatar !== '/uploads/profilePictures/default_profile_picture.png'
									? `${playerRoute}/${conv.user1_id === user.id ? conv.user2_id : conv.user1_id}/profile-picture`
									: PFP_Default}
								alt={conv.other_username}
								onError={e => { e.target.src = PFP_Default }}
							/>
							<div className="flex flex-col gap-0.5 flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<span className="text-sm font-bold uppercase tracking-wider text-purple-pale truncate">{conv.other_username}</span>
									{Number(conv.unread_count) > 0 && (
										<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-brand px-1 text-[0.6rem] font-bold text-white flex-shrink-0 ml-2">
											{conv.unread_count}
										</span>
									)}
								</div>
								{conv.last_message && (
									<span className="text-xs text-white/40 truncate">{conv.last_message}</span>
								)}
							</div>
						</button>
					))
				)}
			</div>
		</div>
	)
}

// ─── Individual Chat Window ─────────────────────────────────────────────────
const TYPING_TIMEOUT_MS = 1500

function DMChatWindow({ chat, onClose, onMinimize, mobile }) {
	const { user, authFetch } = useAuth()
	const { on, emit } = useChat()
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState('')
	const [loading, setLoading] = useState(true)
	const [isTyping, setIsTyping] = useState(false)
	const bottomRef = useRef(null)
	const typingTimer = useRef(null)
	const typingDebounce = useRef(null)
	const inputRef = useRef(null)

	// Fetch history
	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const res = await authFetch(`${chatRoute}/dm/${chat.conversationId}/history`)
				if (res?.ok) {
					const data = await res.json()
					setMessages(data.reverse())
				}
			} catch (err) {
				console.error('Failed to fetch DM history:', err)
			} finally {
				setLoading(false)
			}
		}
		fetchHistory()
	}, [chat.conversationId, authFetch])

	// Listen for new messages in this conversation
	useEffect(() => {
		if (!on)
			return

		return on('dm:message', (msg) => {
			if (msg.conversation_id === chat.conversationId)
				setMessages(prev => [...prev, msg])
		})
	}, [on, chat.conversationId])

	// Listen for read receipts — mark our sent messages as read
	useEffect(() => {
		if (!on)
			return

		return on('dm:read', ({ conversationId, readAt }) => {
			if (conversationId !== chat.conversationId)
				return
			setMessages(prev => prev.map(msg =>
				msg.sender_id === user.id && !msg.read_at
					? { ...msg, read_at: readAt }
					: msg
			))
		})
	}, [on, chat.conversationId, user.id])

	// Listen for typing indicator
	useEffect(() => {
		if (!on)
			return

		return on('dm:typing', ({ conversationId }) => {
			if (conversationId !== chat.conversationId)
				return
			setIsTyping(true)
			clearTimeout(typingTimer.current)
			typingTimer.current = setTimeout(() => setIsTyping(false), TYPING_TIMEOUT_MS)
		})
	}, [on, chat.conversationId])

	// Mark as read when window is open and not minimized
	useEffect(() => {
		if (chat.minimized || !emit)
			return

		emit('dm:read', { conversationId: chat.conversationId })
	}, [chat.minimized, chat.conversationId, emit, messages.length])

	// Auto-scroll
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Focus input when opened
	useEffect(() => {
		if (!chat.minimized)
			inputRef.current?.focus()
	}, [chat.minimized])

	const handleTyping = () => {
		clearTimeout(typingDebounce.current)
		typingDebounce.current = setTimeout(() => {
			emit('dm:typing', { conversationId: chat.conversationId })
		}, 100)
	}

	const sendMessage = async () => {
		const content = draft.trim()
		if (!content)
			return

		setDraft('')
		try {
			await authFetch(`${chatRoute}/dm/${chat.conversationId}/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			})
		} catch (err) {
			console.error('Failed to send DM:', err)
		}
	}

	const handleKey = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendMessage()
		}
	}

	const avatarSrc = chat.avatar || PFP_Default

	if (chat.minimized) {
		return (
			<button
				className="pointer-events-auto relative flex h-11 items-center gap-2 rounded-full border border-purple-mid bg-card px-3 shadow-lg shadow-purple-brand/15 hover:border-purple-light transition-all cursor-pointer"
				onClick={onMinimize}
			>
				<img className="h-7 w-7 rounded-full border border-purple-brand/30 object-cover" src={avatarSrc} alt={chat.username} onError={e => { e.target.src = PFP_Default }} />
				<span className="text-xs font-bold uppercase tracking-wider text-purple-pale max-w-[80px] truncate">{chat.username}</span>
			</button>
		)
	}

	return (
		<div className={mobile
			? "flex flex-1 flex-col bg-transparent"
			: "pointer-events-auto flex w-[calc(100vw-2rem)] flex-col rounded-xl border border-purple-mid bg-card backdrop-blur-3xl shadow-card h-[70vh] md:w-72 md:h-[380px]"
		}>
			{/* Header */}
			<div className="flex items-center gap-2 border-b border-purple-dim px-3 py-2 flex-shrink-0">
				<img className="h-7 w-7 rounded-full border border-purple-brand/30 object-cover" src={avatarSrc} alt={chat.username} onError={e => { e.target.src = PFP_Default }} />
				<span className="flex-1 text-xs font-bold uppercase tracking-wider text-purple-pale truncate">{chat.username}</span>
				<button
					className="flex h-6 w-6 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white text-xs transition-colors cursor-pointer"
					onClick={onMinimize}
					title="Minimize"
				>
					&#8722;
				</button>
				<button
					className="flex h-6 w-6 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-red-400 text-xs transition-colors cursor-pointer"
					onClick={onClose}
					title="Close"
				>
					&#10005;
				</button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 flex flex-col gap-1 [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]">
				{loading ? (
					<p className="text-xs uppercase tracking-ui text-purple-pale/50 text-center py-4 m-0 animate-crt-blink">Loading...</p>
				) : messages.length === 0 ? (
					<p className="text-xs text-white/30 text-center py-4 m-0">Start a conversation</p>
				) : (
					messages.map(msg => (
						<div
							key={msg.id}
							className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs break-words ${
								msg.sender_id === user.id
									? 'self-end bg-purple-brand/25 text-purple-pale border border-purple-brand/30'
									: 'self-start bg-white/8 text-white/85 border border-white/10'
							}`}
						>
							{msg.content}
							{msg.sender_id === user.id && (
								<span className={`ml-1.5 text-[0.6rem] ${msg.read_at ? 'text-cyan-glow/70' : 'text-white/25'}`}>
									{msg.read_at ? '✓✓' : '✓'}
								</span>
							)}
						</div>
					))
				)}
				<div ref={bottomRef} />
			</div>

			{/* Typing indicator */}
			{isTyping && (
				<p className="m-0 px-3 py-1 text-[0.65rem] italic text-white/40 flex-shrink-0">
					{chat.username} is typing...
				</p>
			)}

			{/* Input */}
			<div className="flex-shrink-0 flex border-t border-purple-dim">
				<input
					ref={inputRef}
					className="flex-1 border-none bg-transparent px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/30"
					value={draft}
					onChange={e => { setDraft(e.target.value); handleTyping() }}
					onKeyDown={handleKey}
					placeholder="Type a message..."
					maxLength={500}
				/>
				<button
					className="px-3 py-2.5 text-xs uppercase tracking-ui text-purple-brand hover:text-purple-light border-none bg-transparent cursor-pointer transition-colors"
					onClick={sendMessage}
				>
					Send
				</button>
			</div>
		</div>
	)
}

export default DMChatOverlay
