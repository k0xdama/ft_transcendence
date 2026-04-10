import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { SOUNDS } from "./SoundBuzzers";
import "./ChatOverlay.css"

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
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState("")
	const [typingUsers, setTypingUsers] = useState([])
	const bottomRef = useRef(null)
	const typingTimers = useRef({})
	const typingDebounce = useRef(null)
	const { authFetch, user } = useAuth()
	const { connected, on, emit } = useChat()
	const chatUrl = '/api/chat'

	// Fetch history separately — runs once when the room/user changes.
	useEffect(() => {
		if (!user || !lobbyId)
			return

		const fetchHistory = async () => {
			try {
				const res = await authFetch(`${chatUrl}/room/${lobbyId}/history`)
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

	// Wire chat events through the shared ChatContext socket.
	// Wait until 'connected' so the 'chat:join' emit isn't dropped.
	useEffect(() => {
		if (!user || !lobbyId || !connected)
			return

		emit('chat:join', { lobbyId })

		const offMessage = on('chat:message', (msg) => {
			setMessages(prev => [...prev, mapMessage(user.id, msg)])
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

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const postMessage = async (content, messageType) => {
		try {
			await authFetch(`${chatUrl}/room/send`, {
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

	return (
		<div className="chat-overlay">
			<div className="chat-messages">
				{messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
				<div ref={bottomRef} />
			</div>

			{typingUsers.length > 0 && (
				<p className="chat-typing">
					{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
				</p>
			)}

			<div className="chat-quick-replies">
				{QUICK_REPLIES.map(text => (
					<button key={text} className="chat-quick-reply" onClick={() => sendQuickReply(text)}>
						{text}
					</button>
				))}
			</div>

			<div className="chat-input-row">
				<input
					className="chat-input"
					value={draft}
					onChange={e => { setDraft(e.target.value); handleTyping(e.target.value) }}
					onKeyDown={handleKey}
					placeholder="Type a message..."
				/>
				<button className="chat-send" onClick={sendMessage}>Send</button>
			</div>
		</div>
	)
}

function ChatMessage({ msg }) {
	if (msg.type === 'notification')
		return (
			<div className="chat-message chat-notification">
				<span className="chat-text">{msg.text}</span>
			</div>
		)

	return (
		<div className={`chat-message ${msg.author === 'You' ? 'chat-self' : ''}`}>
			<span className="chat-author" style={{ color: getAuthorColor(msg.author) }}>{msg.author}: </span>
			<span className="chat-text">{msg.text}</span>
		</div>
	)
}

function mapMessage(userId, msg) {
	return {
		id: msg.id,
		author: msg.sender_id === userId
			? 'You'
			: msg.username,
		text: msg.content,
		type: msg.message_type
	}
}

export default ChatOverlay