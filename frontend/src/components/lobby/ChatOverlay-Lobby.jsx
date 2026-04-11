import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import "./ChatOverlay-Lobby.css"

const TYPING_TIMEOUT_MS = 2000;

const QUICK_REPLIES = [
	'Hello', 'Hi', 'Hi everyone!', 'Wazzup?'
];

function ChatOverlay({ lobbyId, gameStarting }) {
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState("")
	const [typingUsers, setTypingUsers] = useState([])
	const bottomRef = useRef(null)
	const typingTimers = useRef({})
	const { authFetch, user } = useAuth()
	const { connected, on, emit } = useChat()
	const navigate = useNavigate()
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
			offNotif()
		}
	}, [lobbyId, user, connected, on, emit])

	useEffect(() => {
		if (!gameStarting)
			return
		setMessages(prev => [...prev, {
			id: 'system-game-starting',
			author: 'System',
			text: 'The game is starting!',
			type: 'notification'
		}])
	}, [gameStarting])

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

	const sendInvite = () => postMessage(lobbyId, 'game_invite')

	const handleTyping = () => emit('chat:typing', { lobbyId })

	const handleKey = (e) => {
		if (e.key === "Enter")
			sendMessage()
	}

	return (
		<div className="absolute bottom-12 left-4 z-10 flex max-h-[380px] w-[340px] flex-col overflow-hidden rounded-lg bg-black/45 transition-colors duration-300 hover:bg-black/55">
			<div className="flex justify-end border-b border-white/[0.08] px-2 py-[0.3rem]">
				<button className="rounded border border-[rgba(157,78,221,0.4)] bg-[rgba(157,78,221,0.15)] px-[0.6rem] py-[0.2rem] font-sans text-[0.7rem] text-white/75 transition-colors duration-150 hover:border-[#9d4edd] hover:bg-[rgba(157,78,221,0.3)] hover:text-white" onClick={sendInvite}>Send Invite</button>
			</div>

			<div className="min-h-0 flex flex-1 flex-col items-start gap-[0.2rem] overflow-y-auto px-3 py-2 text-[0.8rem] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar]:w-1">
				{messages.map(msg => <ChatMessage key={msg.id} msg={msg} onJoin={navigate} />)}
				<div ref={bottomRef} />
			</div>

			{typingUsers.length > 0 && (
				<p className="m-0 shrink-0 px-3 py-[0.2rem] font-sans text-[0.7rem] italic text-white/40">
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
					onChange={e => { setDraft(e.target.value); handleTyping() }}
					onKeyDown={handleKey}
					placeholder="Type a message..."
				/>
				<button className="cursor-pointer rounded-none border-none border-l border-white/10 bg-transparent px-[0.6rem] py-[0.4rem] text-base text-[#9d4edd] hover:border-transparent hover:bg-white/5" onClick={sendMessage}>Send</button>
			</div>
		</div>
	)
}

function ChatMessage({ msg, onJoin }) {
	if (msg.type === 'notification')
		return (
			<div className="w-full shrink-0 break-words text-left leading-[1.4]">
				<span className="font-sans text-[0.75rem] italic text-white/45">⚙ {msg.text}</span>
			</div>
		)

	if (msg.type === 'game_invite' && msg.author !== 'You')
		return (
			<div className="w-full shrink-0 break-words text-left leading-[1.4]">
				<span className="font-bold text-[#9d4edd]">{msg.author}</span>
				<span className="font-sans text-white/90"> invites you to play </span>
				<button className="rounded border border-[#9d4edd]/50 bg-[#9d4edd]/15 px-2 py-[0.1rem] text-[0.72rem] text-white/90 hover:bg-[#9d4edd]/30" onClick={() => onJoin(`/lobby/${msg.text}`)}>
					Join
				</button>
			</div>
		)

	return (
		<div className="w-full shrink-0 break-words text-left leading-[1.4]">
			<span className={`font-bold ${msg.author === 'You' ? 'text-[#7eb8f7]' : 'text-[#9d4edd]'}`}>{msg.author}: </span>
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
