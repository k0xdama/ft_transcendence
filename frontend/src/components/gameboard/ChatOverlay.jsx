import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./ChatOverlay.css"

function ChatOverlay({ roomId }) {
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState("")
	const bottomRef = useRef(null)
	const { authFetch, user } = useAuth()

	useEffect(() => {
		if (!user) return

		const fetchHistory = async () => {
			try {
				const res = await authFetch(`http://localhost:2000/chat/lobby/${roomId}/history`)
				if (!res || !res.ok) return

				const data = await res.json()
				const mapped = data.reverse().map(msg => ({
					id: msg.id,
					author: msg.sender_id == user?.id ? "You" : msg.username,
					text: msg.content
				}))
				setMessages(mapped)
			} catch (err) {
				console.error('Failed to fetch chat history:', err)
			}
		}

		fetchHistory()
		const interval = setInterval(fetchHistory, 3000)
		return () => clearInterval(interval)
	}, [roomId, user])

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" }) 
		}, [messages]
	)

	const sendMessage = async () => {
		if (!draft.trim()) return

		const content = draft
		setDraft("")

		try {
			await authFetch('http://localhost:2000/chat/lobby/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ roomId, content, messageType: 'user_text' })
			})
		} catch (err) {
			console.error('Failed to send message:', err)
		}
	}

	const handleKey = (e) => {
		if (e.key === "Enter") sendMessage()
	}

	return (
		<div className="chat-overlay">
			<div className="chat-messages">
				{messages.map(msg => (
					<div key={msg.id} className={`chat-message ${msg.author === "You" ? "chat-self" : ""}`}>
						<span className="chat-author">{msg.author}: </span>
						<span className="chat-text">{msg.text}</span>
					</div>
				))}
				<div ref={bottomRef} />
			</div>

			<div className="chat-input-row">
				<input
					className="chat-input"
					value={draft}
					onChange={e => setDraft(e.target.value)}
					onKeyDown={handleKey}
					placeholder="Type a message..."
				/>
				<button className="chat-send" onClick={sendMessage}>Send</button>
			</div>
		</div>
	)

}

export default ChatOverlay