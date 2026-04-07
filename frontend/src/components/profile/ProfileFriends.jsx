import { useState } from 'react'

// Mock data for visual preparation — will be replaced with real API calls
const MOCK_FRIENDS = [
	{ id: '1', username: 'NeonSlayer42', avatarUrl: null, status: 'online' },
	{ id: '2', username: 'CyberPunk_X', avatarUrl: null, status: 'in-game' },
	{ id: '3', username: 'RetroWave', avatarUrl: null, status: 'offline' },
	{ id: '4', username: 'PixelDrift', avatarUrl: null, status: 'online' },
	{ id: '5', username: 'SynthRider', avatarUrl: null, status: 'offline' },
	{ id: '6', username: 'GlitchHunter', avatarUrl: null, status: 'in-game' },
	{ id: '7', username: 'VaporTrail', avatarUrl: null, status: 'online' },
	{ id: '8', username: 'DarkMatter99', avatarUrl: null, status: 'offline' },
	{ id: '9', username: 'ZeroGravity', avatarUrl: null, status: 'online' },
	{ id: '10', username: 'NovaStrike', avatarUrl: null, status: 'offline' },
	{ id: '11', username: 'ByteCrusher', avatarUrl: null, status: 'in-game' },
	{ id: '12', username: 'PhantomAce', avatarUrl: null, status: 'online' },
]

const STATUS_ORDER = { 'online': 0, 'in-game': 1, 'offline': 2 }
const STATUS_LABELS = { 'online': 'Online', 'in-game': 'In Game', 'offline': 'Offline' }

function ProfileFriends() {
	const [searchQuery, setSearchQuery] = useState('')

	const filtered = MOCK_FRIENDS
		.filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])

	const onlineCount = MOCK_FRIENDS.filter(f => f.status !== 'offline').length

	return (
		<div className="friends-container">
			<div className="friends-header-row">
				<span className="friends-count">
					<span className="friends-count-online">{onlineCount}</span>
					<span className="friends-count-total">/ {MOCK_FRIENDS.length} online</span>
				</span>
				<input
					type="text"
					className="friends-search"
					placeholder="Search friends..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
				/>
			</div>

			<div className="friends-list">
				{filtered.length === 0 && (
					<p className="friends-empty">No friends found</p>
				)}
				{filtered.map(friend => (
					<div key={friend.id} className="friend-item">
						<div className="friend-avatar-wrapper">
							<img
								className="friend-avatar"
								src={friend.avatarUrl || '/src/assets/PFP_Default.webp'}
								alt={friend.username}
							/>
							<span className={`friend-status-dot status-${friend.status}`} />
						</div>
						<div className="friend-info">
							<span className="friend-username">{friend.username}</span>
							<span className={`friend-status-text status-${friend.status}`}>
								{STATUS_LABELS[friend.status]}
							</span>
						</div>
						<div className="friend-actions">
							<button className="btn-friend-action btn-friend-profile" title="View Profile">
								&#9782;
							</button>
							<button className="btn-friend-action btn-friend-remove" title="Remove Friend">
								&#10005;
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default ProfileFriends
