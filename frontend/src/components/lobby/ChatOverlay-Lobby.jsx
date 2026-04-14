import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import {
	CHAT_ROUTE,
	ChatInputBar,
	MessagesScroll,
	MobileChatFab,
	MobileChatPanel,
	MobileCloseBtn,
	QuickReplyBar,
	TypingLine,
	mapChatMessage,
} from "../chat/ChatUI";
import { IconChat, IconSystem } from "../icons/Icons";

const PLAYER_ROUTE = '/api/players';
const TYPING_TIMEOUT_MS = 2000;

const QUICK_REPLIES = [
	'Hello', 'Hi', 'Hi everyone!', 'Wazzup?'
];

function ChatOverlay({ lobbyId, gameStarting }) {
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState("")
	const [typingUsers, setTypingUsers] = useState([])
	const [showInvite, setShowInvite] = useState(false)
	const [friends, setFriends] = useState([])
	const [friendsLoading, setFriendsLoading] = useState(false)
	const [inviteSent, setInviteSent] = useState({})
	const [mobileOpen, setMobileOpen] = useState(false)
	const [unreadCount, setUnreadCount] = useState(0)
	const mobileOpenRef = useRef(false)
	const bottomRef = useRef(null)
	const typingTimers = useRef({})
	const { authFetch, user } = useAuth()
	const { connected, on, emit } = useChat()
	const navigate = useNavigate()

	// Fetch history separately — runs once when the room/user changes.
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

	// Wire chat events through the shared ChatContext socket.
	// Wait until 'connected' so the 'chat:join' emit isn't dropped.
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

	const openInvitePanel = async () => {
		setShowInvite(prev => !prev)
		if (!showInvite) {
			setFriendsLoading(true)
			try {
				const res = await authFetch(`${PLAYER_ROUTE}/me/friends`)
				if (res.ok) {
					const data = await res.json()
					setFriends(data.friends.map(f => ({
						id: f.auth_user_id,
						username: f.username
					})))
				}
			} catch (err) {
				console.error('Failed to fetch friends:', err)
			} finally {
				setFriendsLoading(false)
			}
		}
	}

	const sendInviteTo = async (friendId) => {
		try {
			const dmRes = await authFetch(`${CHAT_ROUTE}/dm`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetId: friendId })
			})
			if (!dmRes.ok)
				return

			const conversation = await dmRes.json()

			await authFetch(`${CHAT_ROUTE}/dm/${conversation.id}/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: `Join my lobby! Code: ${lobbyId}` })
			})
			setInviteSent(prev => ({ ...prev, [friendId]: true }))
		} catch (err) {
			console.error('Failed to send invite:', err)
		}
	}

	const handleTyping = () => emit('chat:typing', { lobbyId })

	const handleKey = (e) => {
		if (e.key === "Enter")
			sendMessage()
	}

	const chatContent = (
		<>
			<div className="relative flex justify-between items-center border-b border-white/[0.08] px-2 py-[0.3rem]">
				<div className="md:hidden">
					<MobileCloseBtn onClick={() => setMobileOpen(false)} ariaLabel="Close chat" />
				</div>
				<div className="flex-1" />
				<button className="rounded border border-[rgba(157,78,221,0.4)] bg-[rgba(157,78,221,0.15)] px-[0.6rem] py-[0.2rem] font-sans text-[0.7rem] text-white/75 transition-colors duration-150 hover:border-[#9d4edd] hover:bg-[rgba(157,78,221,0.3)] hover:text-white" onClick={openInvitePanel}>Send Invite</button>
				{showInvite && (
					<div className="absolute right-0 top-full z-20 mt-1 w-[260px] rounded-lg border border-purple-mid bg-[rgba(10,5,20,0.95)] p-2 shadow-card backdrop-blur-md">
						<p className="m-0 mb-2 text-center text-[0.7rem] uppercase tracking-ui text-purple-pale/70">Invite a friend</p>
						{friendsLoading ? (
							<p className="m-0 py-2 text-center text-[0.65rem] text-white/40">Loading...</p>
						) : friends.length === 0 ? (
							<p className="m-0 py-2 text-center text-[0.65rem] text-white/40">No friends yet</p>
						) : (
							<ul className="m-0 flex max-h-[160px] list-none flex-col gap-1 overflow-y-auto p-0 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
								{friends.map(f => (
									<li key={f.id} className="flex items-center justify-between rounded px-2 py-1.5 text-[0.75rem] text-white/85 hover:bg-white/5">
										<span className="truncate">{f.username}</span>
										<button
											className={`shrink-0 rounded border px-2 py-0.5 text-[0.65rem] uppercase tracking-ui transition-colors ${inviteSent[f.id] ? 'border-green-500/50 bg-green-500/15 text-green-400 cursor-default' : 'border-cyan-str bg-btn-cyan text-cyan-glow hover:bg-[rgba(0,200,255,0.18)]'}`}
											onClick={() => !inviteSent[f.id] && sendInviteTo(f.id)}
											disabled={inviteSent[f.id]}
										>
											{inviteSent[f.id] ? 'Sent ✓' : 'Invite'}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>

			<MessagesScroll bottomRef={bottomRef}>
				{messages.map(msg => <ChatMessage key={msg.id} msg={msg} onJoin={navigate} />)}
			</MessagesScroll>

			<TypingLine users={typingUsers} />

			<QuickReplyBar replies={QUICK_REPLIES} onSelect={sendQuickReply} />

			<ChatInputBar
				value={draft}
				onChange={e => { setDraft(e.target.value); handleTyping() }}
				onKeyDown={handleKey}
				onSend={sendMessage}
			/>
		</>
	)

	return (
		<>
			<MobileChatFab
				icon={<IconChat />}
				unread={unreadCount}
				onClick={() => setMobileOpen(true)}
				hidden={mobileOpen}
				ariaLabel="Open chat"
				positionClassName="md:hidden fixed bottom-4 left-4"
			/>

			{mobileOpen && (
				<MobileChatPanel className="md:hidden">
					{chatContent}
				</MobileChatPanel>
			)}

			{/* Desktop: fixed chat panel (unchanged behavior) */}
			<div className="hidden md:flex fixed bottom-14 left-4 z-30 max-h-[380px] w-[340px] flex-col overflow-hidden rounded-lg bg-black/45 backdrop-blur-md transition-colors duration-300 hover:bg-black/55">
				{chatContent}
			</div>
		</>
	)
}

function ChatMessage({ msg, onJoin }) {
	if (msg.type === 'notification')
		return (
			<div className="w-full shrink-0 break-words text-left leading-[1.4]">
				<span className="font-sans text-[0.75rem] italic text-white/45"><IconSystem /> {msg.text}</span>
			</div>
		)

	if (msg.type === 'game_invite' && msg.author !== 'You')
		return (
			<div className="w-full shrink-0 break-words text-left leading-[1.4]">
				<span className="font-bold text-[#9d4edd] cursor-pointer hover:underline" onClick={() => onJoin(`/profile/${msg.senderId}`)}>{msg.author}</span>
				<span className="font-sans text-white/90"> invites you to play </span>
				<button className="rounded border border-[#9d4edd]/50 bg-[#9d4edd]/15 px-2 py-[0.1rem] text-[0.72rem] text-white/90 hover:bg-[#9d4edd]/30" onClick={() => onJoin(`/lobby/${msg.text}`)}>
					Join
				</button>
			</div>
		)

	return (
		<div className="w-full shrink-0 break-words text-left leading-[1.4]">
			<span
				className={`font-bold ${msg.author === 'You' ? 'text-[#7eb8f7]' : 'text-[#9d4edd] cursor-pointer hover:underline'}`}
				onClick={() => msg.author !== 'You' && onJoin(`/profile/${msg.senderId}`)}
			>
				{msg.author}:{' '}
			</span>
			<span className="font-sans text-white/90">{msg.text}</span>
		</div>
	)
}

export default ChatOverlay
