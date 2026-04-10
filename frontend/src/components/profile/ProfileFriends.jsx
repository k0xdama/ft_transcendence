import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const STATUS_ORDER = { 'online': 0, 'in-game': 1, 'offline': 2 }
const STATUS_LABELS = { 'online': 'Online', 'in-game': 'In Game', 'offline': 'Offline' }

function ProfileFriends() {
	const { authFetch } = useAuth()
	const [friends, setFriends] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		fetchFriends()
	}, [])

	const fetchFriends = async () => {
		try {
			const response = await authFetch('/api/players/me/friends')
			if (!response.ok) {
				throw new Error('Failed to fetch friends')
			}
			const data = await response.json()
			// Transform API data to match component expectations
			const transformedFriends = data.friends.map(friend => ({
				id: friend.auth_user_id,
				username: friend.username,
				avatarUrl: friend.pp_path && friend.pp_path !== '/uploads/profilePictures/default_profile_picture.png'
					? `/api/players/${friend.auth_user_id}/profile-picture`
					: null,
				status: 'online' // TODO: Add real status from API if available
			}))
			setFriends(transformedFriends)
		} catch (err) {
			setError('Failed to load friends')
			console.error('Error fetching friends:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleRemoveFriend = async (friendId) => {
		try {
			const response = await authFetch(`/api/players/me/friends/${friendId}`, {
				method: 'DELETE'
			})

			if (!response.ok) {
				throw new Error('Failed to remove friend')
			}

			await fetchFriends()
		} catch (err) {
			setError('Failed to remove friend')
			console.error('Error removing friend:', err)
		}
	}

	const handleBlockUser = async (friendId) => {
		try {
			const response = await authFetch(`/api/players/me/blocked/${friendId}`, {
				method: 'POST'
			})

			if (!response.ok) {
				throw new Error('Failed to block user')
			}

			await fetchFriends()
		} catch (err) {
			setError('Failed to block user')
			console.error('Error blocking user:', err)
		}
	}

	const filtered = friends
		.filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])

	const onlineCount = friends.filter(f => f.status !== 'offline').length

	if (loading) {
		return (
			<div className="flex flex-col gap-4 max-h-96 min-h-0">
				<p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink m-0 py-6">Loading friends...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex flex-col gap-4 max-h-96 min-h-0">
				<p className="text-red-500 text-xs text-center m-0 py-6">{error}</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 max-h-96 min-h-0">
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

			<div className="flex flex-col gap-1.5 overflow-y-auto min-h-0 flex-1 pr-1">
				{filtered.length === 0 && (
					<p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-6 m-0">No friends found</p>
				)}
				{filtered.map(friend => (
					<div key={friend.id} className="flex items-center gap-3 px-3.5 py-2.5 bg-white/4 border border-purple-dim rounded-xl hover:border-purple-mid hover:shadow-lg hover:shadow-purple-brand/10 transition-all">
						<div className="relative flex-shrink-0">
							<img
								className="w-9 h-9 rounded-full border-2 border-purple-brand/30 object-cover"
								src={friend.avatarUrl || '/src/assets/PFP_Default.webp'}
								alt={friend.username}
							/>
							<span className={`absolute bottom-0 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-opacity-90 ${
								friend.status === 'online' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
								friend.status === 'in-game' ? 'bg-cyan-glow shadow-lg shadow-cyan-glow/50' :
								'bg-purple-pale/30'
							}`} />
						</div>
						<div className="flex flex-col gap-0.5 flex-1 min-w-0">
							<span className="text-sm font-bold uppercase tracking-wider text-purple-pale truncate">{friend.username}</span>
							<span className={`text-xs uppercase tracking-ui ${
								friend.status === 'online' ? 'text-green-400' :
								friend.status === 'in-game' ? 'text-cyan-glow' :
								'text-purple-pale/40'
							}`}>
								{STATUS_LABELS[friend.status]}
							</span>
						</div>
						<div className="flex gap-1.5 flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity">
							<button className="w-7 h-7 rounded border border-purple-mid/20 bg-white/4 text-purple-pale/60 text-xs cursor-pointer flex items-center justify-center hover:border-cyan-glow/50 hover:bg-cyan-glow/10 hover:text-cyan-glow transition-all" title="View Profile">
								&#9782;
							</button>
							<button className="w-7 h-7 rounded border border-purple-mid/20 bg-white/4 text-purple-pale/60 text-xs cursor-pointer flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all" title="Remove Friend" onClick={() => handleRemoveFriend(friend.id)}>
								&#10005;
							</button>
							<button className="w-7 h-7 rounded border border-purple-mid/20 bg-white/4 text-purple-pale/60 text-xs cursor-pointer flex items-center justify-center hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400 transition-all" title="Block User" onClick={() => handleBlockUser(friend.id)}>
								&#128274;
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default ProfileFriends
