import { useEffect, useRef, useState } from "react";
import "./ChatOverlay.css"

function ChatOverlay() {
	const	[messages, setMessages] = useState([
		{ id: 1, author: "Opponent 1", text: "FAHHHHHHHH" },
		{ id: 2, author: "Opponent 3", text: "Nice game" },
	])
	const	[draft, setDraft] = useState("")
	const bottomRef = useRef(null)

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" }) 
	}, [messages])

	const	sendMessage = () => {
		if (!draft.trim()) return
		setMessages(prev => [...prev, { id: Date.now(), author: "You", text: draft }])
		setDraft("")
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
