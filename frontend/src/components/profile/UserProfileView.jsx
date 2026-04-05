import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileStats from './ProfileStats'
import ProfileAchievements from './ProfileAchievements'
import ProfileSettings from './ProfileSettings'
import DeleteAccountModal from './DeleteAccountModal'
import './UserProfileView.css'

function UserProfileView() {
	const { userId } = useParams()
	const navigate = useNavigate()
	const { user, isAuthenticated, authFetch, logout } = useAuth()

	const [activeTab, setActiveTab] = useState('stats')
	const [profileData, setProfileData] = useState(null)
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [friendStatus, setFriendStatus] = useState(null) // 'friend', 'pending', 'none', 'blocked'
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const isOwnProfile = !userId || (user && userId === user.id)
	const targetUserId = userId || (user && user.id)

	useEffect(() => {
		if (!targetUserId) return
		fetchProfileData()
		fetchStats()
		if (!isOwnProfile) fetchFriendStatus()
	}, [targetUserId])

	const fetchProfileData = async () => {
		setLoading(true)
		try {
			// TODO: Replace with actual API call when user-service is implemented
			// const response = await authFetch(`http://localhost:4000/api/users/${targetUserId}`)
			// const data = await response.json()
			// setProfileData(data)

			// Mock data for now - use current user data if own profile
			if (isOwnProfile && user) {
				setProfileData({
					id: user.id,
					username: user.username,
					email: user.email,
					avatarUrl: null,
					createdAt: new Date().toISOString()
				})
			} else {
				setProfileData({
					id: targetUserId,
					username: 'Player_' + targetUserId?.slice(0, 6),
					avatarUrl: null,
					createdAt: new Date().toISOString()
				})
			}
		} catch (err) {
			console.error('Failed to fetch profile:', err)
			setError('Failed to load profile')
		} finally {
			setLoading(false)
		}
	}

	const fetchStats = async () => {
		try {
			// TODO: Replace with actual API call when stats endpoint is implemented
			// const response = await authFetch(`http://localhost:4000/api/users/${targetUserId}/stats`)
			// const data = await response.json()
			// setStats(data)

			// Mock stats
			setStats({
				gamesPlayed: 0,
				gamesWon: 0,
				gamesLost: 0,
				totalScore: 0,
				totalActions: 0,
				triosOf7: 0,
				totalCombos: 0,
				longestCombo: 0,
				perfectGames: 0
			})
		} catch (err) {
			console.error('Failed to fetch stats:', err)
		}
	}

	const fetchFriendStatus = async () => {
		try {
			// TODO: Replace with actual API call when friend-service is implemented
			// const response = await authFetch(`http://localhost:4000/api/users/${user.id}/friends/${targetUserId}/status`)
			// const data = await response.json()
			// setFriendStatus(data.status)
			setFriendStatus('none')
		} catch (err) {
			console.error('Failed to fetch friend status:', err)
		}
	}

	const handleAddFriend = async () => {
		try {
			// TODO: Replace with actual API call
			// await authFetch(`http://localhost:4000/api/users/${user.id}/friends/${targetUserId}`, { method: 'POST' })
			setFriendStatus('pending')
		} catch (err) {
			setError('Failed to send friend request')
		}
	}

	const handleRemoveFriend = async () => {
		try {
			// TODO: Replace with actual API call
			// await authFetch(`http://localhost:4000/api/users/${user.id}/friends/${targetUserId}`, { method: 'DELETE' })
			setFriendStatus('none')
		} catch (err) {
			setError('Failed to remove friend')
		}
	}

	const handleBlock = async () => {
		try {
			// TODO: Replace with actual API call
			// await authFetch(`http://localhost:4000/api/users/${user.id}/block/${targetUserId}`, { method: 'POST' })
			setFriendStatus('blocked')
		} catch (err) {
			setError('Failed to block user')
		}
	}

	const handleAvatarUpload = async (file) => {
		try {
			// TODO: Replace with actual API call
			// const formData = new FormData()
			// formData.append('avatar', file)
			// await authFetch(`http://localhost:4000/api/users/${user.id}/avatar`, {
			//   method: 'POST',
			//   body: formData
			// })
			// fetchProfileData()
			console.log('Avatar upload not yet implemented:', file.name)
		} catch (err) {
			setError('Failed to upload avatar')
		}
	}

	const handleAvatarDelete = async () => {
		try {
			// TODO: Replace with actual API call
			// await authFetch(`http://localhost:4000/api/users/${user.id}/avatar`, { method: 'DELETE' })
			// fetchProfileData()
			console.log('Avatar delete not yet implemented')
		} catch (err) {
			setError('Failed to delete avatar')
		}
	}

	const handleUpdateProfile = async (field, value) => {
		try {
			// TODO: Replace with actual API call
			// await authFetch(`http://localhost:4000/api/users/${user.id}`, {
			//   method: 'PUT',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ [field]: value })
			// })
			// fetchProfileData()
			console.log(`Update ${field} not yet implemented:`, value)
			return { success: true }
		} catch (err) {
			return { success: false, error: 'Failed to update profile' }
		}
	}

	const handleDeleteAccount = async () => {
		try {
			// TODO: Replace with actual API call
			// await authFetch(`http://localhost:4000/api/users/${user.id}`, { method: 'DELETE' })
			await logout()
			navigate('/')
		} catch (err) {
			setError('Failed to delete account')
		}
	}

	if (!isAuthenticated()) {
		return <Navigate to="/login" />
	}

	if (loading) {
		return (
			<div className="profile-view">
				<div className="profile-card">
					<p className="profile-loading">Loading profile...</p>
				</div>
			</div>
		)
	}

	if (error && !profileData) {
		return (
			<div className="profile-view">
				<div className="profile-card">
					<p className="profile-error">{error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="profile-view">
			<div className="profile-card">
				<ProfileHeader
					profileData={profileData}
					isOwnProfile={isOwnProfile}
					friendStatus={friendStatus}
					onAvatarUpload={handleAvatarUpload}
					onAvatarDelete={handleAvatarDelete}
					onAddFriend={handleAddFriend}
					onRemoveFriend={handleRemoveFriend}
					onBlock={handleBlock}
				/>

				<div className="profile-tabs">
					<button
						className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
						onClick={() => setActiveTab('stats')}
					>
						Stats
					</button>
					<button
						className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
						onClick={() => setActiveTab('achievements')}
					>
						Achievements
					</button>
					{isOwnProfile && (
						<button
							className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
							onClick={() => setActiveTab('settings')}
						>
							Settings
						</button>
					)}
				</div>

				<div className="profile-tab-content">
					{activeTab === 'stats' && (
						<ProfileStats stats={stats} />
					)}
					{activeTab === 'achievements' && (
						<ProfileAchievements stats={stats} />
					)}
					{activeTab === 'settings' && isOwnProfile && (
						<ProfileSettings
							profileData={profileData}
							onUpdate={handleUpdateProfile}
							onDeleteAccount={() => setShowDeleteModal(true)}
						/>
					)}
				</div>
			</div>

			{showDeleteModal && (
				<DeleteAccountModal
					onConfirm={handleDeleteAccount}
					onCancel={() => setShowDeleteModal(false)}
				/>
			)}

			{error && <p className="profile-error">{error}</p>}
		</div>
	)
}

export default UserProfileView
