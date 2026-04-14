import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { IconProfile, IconClose, IconLock } from '../icons/Icons'
import FriendRow from './FriendRow'
import { PLAYER_ROUTE, CHAT_ROUTE } from '../../constants/ApiRoutes'
import { transformFriendEntry } from './ProfileUtils'

const STATUS_ORDER = { 'online': 0, 'in-game': 1, 'offline': 2 }
const STATUS_LABELS = { 'online': 'Online', 'in-game': 'In Game', 'offline': 'Offline' }
const STATUS_COLORS = {
	online:   'text-green-400',
	'in-game': 'text-cyan-glow',
	offline:  'text-purple-pale/40'
}

function ProfileFriends() {
	const { authFetch } = useAuth()
	const { on } = useChat()
	const navigate = useNavigate()
	const [friends, setFriends] = useState([])
	const [blocked, setBlocked] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		fetchFriends()
		fetchBlocked()
	}, [])

	// Listen for online status changes broadcast by chat-service
	useEffect(() => {
		if (!on)
			return
		return on('user:statusChanged', ({ userId, status }) => {
			setFriends(prev => prev.map(f =>
				f.id === userId
				? { ...f, status }
				: f
			))
		})
	}, [on])

		const fetchFriends = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friends`)
			if (!res.ok) throw new Error()
			const { friends: raw } = await res.json()
			const transformed = raw.map(transformFriendEntry)
 
			// Hydrate online statuses in one batch request
			const ids = transformed.map(f => f.id)
			if (ids.length > 0) {
				try {
					const statusRes = await authFetch(`${CHAT_ROUTE}/status/online`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ userIds: ids })
					})
					if (statusRes.ok) {
						const { statuses } = await statusRes.json()
						transformed.forEach(f => { if (statuses[f.id]) f.status = statuses[f.id] })
					}
				} catch { /* statuses default to offline */ }
			}
			setFriends(transformed)
		} catch {
			setError('Failed to load friends')
		} finally {
			setLoading(false)
		}
	}
 
	const fetchBlocked = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/blocked`)
			if (!res.ok) throw new Error()
			const { blocked: raw } = await res.json()
			setBlocked(raw.map(u => ({
				...transformFriendEntry(u),
				blockedAt: u.blocked_at
			})))
		} catch { /* silently ignore */ }
	}

	const handleRemoveFriend = async (friendId) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friends/${friendId}`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			await fetchFriends()
		} catch { setError('Failed to remove friend') }
	}
 
	const handleBlockUser = async (friendId) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/blocked/${friendId}`, { method: 'POST' })
			if (!res.ok) throw new Error()
			await fetchFriends()
		} catch { setError('Failed to block user') }
	}
 
	const handleUnblockUser = async (userId) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/blocked/${userId}`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			await fetchBlocked()
		} catch { setError('Failed to unblock user') }
	}

	const filtered = friends
		.filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
 
	const onlineCount = friends.filter(f => f.status !== 'offline').length
 
	if (loading)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink m-0 py-6">Loading friends...</p>
 
	if (error)
		return <p className="text-red-500 text-xs text-center m-0 py-6">{error}</p>

		return (
		<div className="flex flex-col gap-4 max-h-96 min-h-0">
			{/* Header row */}
			<div className="flex justify-between items-center gap-3 flex-shrink-0">
				<span className="whitespace-nowrap">
					<span className="text-lg font-bold text-green-400 tracking-wide">{onlineCount}</span>
					<span className="text-xs uppercase tracking-ui text-purple-pale/50 ml-1">/ {friends.length} online</span>
				</span>
				<input
					type="text"
					className="flex-1 max-w-52 px-3 py-1.5 rounded text-xs uppercase tracking-wider text-white/87 bg-card-input border border-purple-mid/25 placeholder-white/35 focus:outline-none focus:border-purple-mid/50 focus:shadow-lg focus:shadow-purple-brand/15 transition-all"
					placeholder="Search friends..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
				/>
			</div>
 
			{/* Friend list */}
			<div className="flex flex-col gap-1.5 overflow-y-auto min-h-0 flex-1 pr-1">
				{filtered.length === 0
					? <p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-6 m-0">No friends found</p>
					: filtered.map(friend => (
						<FriendRow
							key={friend.id}
							user={friend}
							statusDot={friend.status}
							statusLabel={STATUS_LABELS[friend.status]}
							statusColor={STATUS_COLORS[friend.status]}
						>
							<div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
								<button className="w-7 h-7 rounded border border-purple-mid/20 bg-white/4 text-purple-pale/60 text-xs cursor-pointer flex items-center justify-center hover:border-cyan-glow/50 hover:bg-cyan-glow/10 hover:text-cyan-glow transition-all" title="View Profile" onClick={() => navigate(`/profile/${friend.id}`)}>
									<IconProfile className="items-center justify-center"/>
								</button>
								<button className="w-7 h-7 rounded border border-purple-mid/20 bg-white/4 text-purple-pale/60 text-xs cursor-pointer flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all" title="Remove Friend" onClick={() => handleRemoveFriend(friend.id)}>
									<IconClose />
								</button>
								<button className="w-7 h-7 rounded border border-purple-mid/20 bg-white/4 text-purple-pale/60 text-xs cursor-pointer flex items-center justify-center hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400 transition-all" title="Block User" onClick={() => handleBlockUser(friend.id)}>
									<IconLock />
								</button>
							</div>
						</FriendRow>
					))
				}
			</div>
 
			{/* Blocked users */}
			<div className="mt-20 flex flex-col gap-3 border-t border-purple-dim pt-5">
				<h3 className="m-0 text-sm font-semibold uppercase tracking-ui text-purple-pale">Blocked Users</h3>
				<div className="profile-scrollbar flex flex-col gap-1.5 max-h-40 overflow-y-auto min-h-0 pr-1">
					{blocked.length === 0
						? <p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-4 m-0">No blocked users found</p>
						: blocked.map(user => (
							<FriendRow
								key={user.id}
								user={user}
								statusLabel={`Blocked ${new Date(user.blockedAt).toLocaleDateString()}`}
							>
								<button
									className="px-2.5 h-7 rounded border border-green-500/50 bg-green-500/8 text-green-400 text-xs uppercase tracking-ui cursor-pointer flex items-center justify-center hover:bg-green-500/18 hover:shadow-lg hover:shadow-green-500/30 transition-all"
									onClick={() => handleUnblockUser(user.id)}
								>
									Unblock
								</button>
							</FriendRow>
						))
					}
				</div>
			</div>
		</div>
	)
}

export default ProfileFriends
