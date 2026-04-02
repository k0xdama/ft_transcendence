import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { SOUNDS } from "./SoundBuzzers";
import "./ChatOverlay.css"

const TYPING_TIMEOUT_MS = 2000;

const QUICK_REPLIES = [
	'GG', 'WP', 'GG WP', 'Unlucky...', 'Nice move!',
	"Let's gooo!", 'My bad', 'Ezzz', 'LOL'
];

function ChatOverlay({ lobbyId, socketRef }) {
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState("")
	const [typingUsers, setTypingUsers] = useState([])
	const bottomRef = useRef(null)
	const typingTimers = useRef({})
	const { authFetch, user } = useAuth()
	const chatUrl = '/api/chat'

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

		socketRef.current = io({
			path: `${chatUrl}/socket.io`,
			withCredentials: true,
			transports: ['websocket']
		})

		socketRef.current.on('connect', () => {
			socketRef.current.emit('chat:join', { lobbyId })
		})

		socketRef.current.on('chat:message', (msg) => {
			setMessages(prev => [...prev, mapMessage(user.id, msg)])
		})

		socketRef.current.on('chat:typing', ({ username }) => {
			setTypingUsers(prev => [...new Set([...prev, username])])
			clearTimeout(typingTimers.current[username])
			typingTimers.current[username] = setTimeout(() => {
				setTypingUsers(prev => prev.filter(u => u !== username))
			}, TYPING_TIMEOUT_MS)
		})

		socketRef.current.on('chat:sound', ({ sound }) => {
			const src = SOUNDS[sound]
			if (src) new Audio(src).play().catch(() => {})
		})

		socketRef.current.on('chat:notification', (notif) => {
			setMessages(prev => [...prev, {
				id: `notif-${Date.now()}`,
				author: 'System',
				text: notif.message || (notif.type === 'game_ended' ? 'The game has ended!' : notif.type),
				type: 'notification'
			}])
		})

		return () => {
			socketRef.current?.disconnect()
			socketRef.current = null
		}
	}, [lobbyId, user])

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

	const handleTyping = () => socketRef.current?.emit('chat:typing', { lobbyId })

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
					onChange={e => { setDraft(e.target.value); handleTyping() }}
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
			<span className="chat-author">{msg.author}: </span>
			<span className="chat-text">{msg.text}</span>
		</div>
	)
}

function mapMessage(userId, msg) {
	return {
		id: msg.id,
		author: msg.sender_id === userId ? 'You' : msg.username,
		text: msg.content,
		type: msg.message_type
	}
}

export default ChatOverlay