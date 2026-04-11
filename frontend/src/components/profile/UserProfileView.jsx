import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileStats from './ProfileStats'
import ProfileAchievements from './ProfileAchievements'
import ProfileFriends from './ProfileFriends'
import ProfileFriendRequests from './ProfileFriendRequests'
import ProfileSettings from './ProfileSettings'
import DeleteAccountModal from './DeleteAccountModal'
// import './UserProfileView.css'

function UserProfileView() {
	const { userId } = useParams()
	const navigate = useNavigate()
	const { user, isAuthenticated, authFetch, logout } = useAuth()
	const playerUrl = '/api/players'

	const [activeTab, setActiveTab] = useState('stats')
	const [profileData, setProfileData] = useState(null)
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [friendStatus, setFriendStatus] = useState(null) // 'friend', 'pending', 'none', 'blocked'
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const tabBaseClass = 'w-full min-w-0 !rounded-none !bg-transparent !border-0 border-b-2 border-b-transparent px-2 py-2 text-[0.64rem] uppercase tracking-ui cursor-pointer transition-colors focus:outline-none focus-visible:outline-none'

	const isOwnProfile = !userId || (user && userId === user.id)
	const targetUserId = userId || (user && user.id)

	useEffect(() => {
		if (!targetUserId)
			return
		fetchProfileData()
		fetchStats()
		if (!isOwnProfile)
			fetchFriendStatus()
	}, [targetUserId])

	const fetchProfileData = async () => {
		setLoading(true)
		try {
			// todo: Peut etre Mettre des donnees par defaut en cas de fail de fetch pour eviter les trous
			const response = await authFetch(`${playerUrl}/${targetUserId}`)
			if (!response.ok) {
				throw new Error('Failed to fetch profile data')
			}

			const playerData = await response.json()

			setProfileData({
				id: playerData.auth_user_id,
				username: playerData.username,
				// email is owned by auth-service and only available for the current user via JWT
				email: isOwnProfile
					? (user && user.email)
					: null,
				avatarUrl: (playerData.pp_path && playerData.pp_path !== '/uploads/profilePictures/default_profile_picture.png')
					? `${playerUrl}/${targetUserId}/profile-picture`
					: null,
				createdAt: playerData.created_at
			})
		} catch (err) {
			console.error('Failed to fetch profile:', err)
			setError('Failed to load profile')
		} finally {
			setLoading(false)
		}
	}

	const fetchStats = async () => {
		try {
			const response = await authFetch(`${playerUrl}/${targetUserId}`)
			if (!response.ok) {
				throw new Error('Failed to fetch stats')
			}
			
			const playerData = await response.json()
			
			// Extraire les stats des données du joueur
			setStats({
				//todo: il va falloir que j'ajoute des slots de stat dans la base de donnees et que je vois quelles stats on affiche
				gamesPlayed: playerData.played_game || 0,
				gamesWon: playerData.won || 0,
				gamesLost: (playerData.played_game - playerData.won) || 0,
				totalScore: playerData.score || 0,
				totalActions: playerData.actions_played || 0,
				triosOf7: playerData.trio_of_7 || 0,
				totalCombos: playerData.combo ,//remplacer lui par rank peut etre
				longestCombo: playerData.longest_combo || 0,
				perfectGames: playerData.perfect_game || 0
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
			const response = await authFetch(`${playerUrl}/me/friend-requests/${targetUserId}`, {
				method: 'POST'
			})
			if (!response.ok) {
				throw new Error('Failed to send friend request')
			}

			setFriendStatus('pending')
		} catch (err) {
			setError('Failed to send friend request')
		}
	}

	const handleRemoveFriend = async () => {
		try {
			const response = await authFetch(`${playerUrl}/me/friends/${targetUserId}`, {
				method: 'DELETE'
			})
			if (!response.ok) {
				throw new Error('Failed to remove friend')
			}

			setFriendStatus('none')
		} catch (err) {
			setError('Failed to remove friend')
		}
	}

	const handleBlock = async () => {
		try {
			const response = await authFetch(`${playerUrl}/me/blocked/${targetUserId}`, {
				method: 'POST'
			})
			if (!response.ok) {
				throw new Error('Failed to block user')
			}

			setFriendStatus('blocked')
		} catch (err) {
			setError('Failed to block user')
		}
	}

	const handleAvatarUpload = async (file) => {
		try {
			const formData = new FormData()
			formData.append('profilePicture', file)  // Clé attendue par upload.single('profilePicture')

			const response = await authFetch(`${playerUrl}/me/profile-picture`, {
				method: 'POST',
				body: formData
				// NE PAS mettre de Content-Type, le navigateur le met automatiquement
			})
			if (!response.ok) {
				throw new Error('Upload failed')
			}

			await response.json()
			setProfileData(prev => ({
				...prev,
				avatarUrl: `${playerUrl}/${user.id}/profile-picture`
			}))
		} catch (err) {
			console.error('Avatar upload error:', err)
			setError('Failed to upload avatar')
		}
	}

	const handleAvatarDelete = async () => {
		try {
			const response = await authFetch(`${playerUrl}/me/profile-picture`, {
				method: 'DELETE'
			})
			if (!response.ok) {
				throw new Error('Delete failed')
			}

			await response.json()
			setProfileData(prev => ({
				...prev,
				avatarUrl: null
			}))
		} catch (err) {
			console.error('Avatar delete error:', err)
			setError('Failed to delete avatar')
		}
	}

	const handleUpdateProfile = async (field, value) => {
		try {
			//todo: ajouter une verif du format et de la disponibilite du username et de l'email avant d'envoyer la requete
			//todo: aussi permettre la modif du mot de passe
			const response = await authFetch(`${playerUrl}/me`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [field]: value })
			})
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Failed to update profile')
			}

			const updatedData = await response.json()
			setProfileData(prev => ({
				...prev,
				[field]: updatedData[field]
			}))

			return { success: true }
		} catch (err) {
			console.error('Error updating profile:', err)
			return { success: false, error: err.message }
		}
	}

	const handleDeleteAccount = async () => {
		try {
			//todo: reverif que tout est dans la norme ca coute rien
			const response = await authFetch(`${playerUrl}/me`, {
				method: 'DELETE'
			})
			if (!response.ok) {
				throw new Error('Failed to delete account')
			}

			await logout()
			navigate('/')
		} catch (err) {
			setError('Failed to delete account', err)
		}
	}

	if (!isAuthenticated()) {
		return <Navigate to="/login" />
	}

	if (loading) {
		return (
			<div className="flex flex-col items-center pt-10 gap-6 w-full">
				<div className="flex flex-col bg-card border border-purple-mid rounded-2xl p-8 w-[620px] h-[62vh] max-w-[92vw] backdrop-blur-3xl shadow-card">
					<p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading profile...</p>
				</div>
			</div>
		)
	}

	if (error && !profileData) {
		return (
			<div className="flex flex-col items-center pt-10 gap-6 w-full">
				<div className="flex flex-col bg-card border border-purple-mid rounded-2xl p-8 w-[620px] h-[62vh] max-w-[92vw] backdrop-blur-3xl shadow-card">
					<p className="text-red-500 text-xs text-center mt-2">{error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center pt-10 gap-6 w-full">
			<div className="flex flex-col bg-card border border-purple-mid rounded-2xl p-8 w-[620px] h-[62vh] max-w-[92vw] backdrop-blur-3xl shadow-card">
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

				<div className={`mb-5 grid w-full ${isOwnProfile ? 'grid-cols-5' : 'grid-cols-4'} gap-1 border-b border-purple-dim pb-1`}>
					<button
						className={`${tabBaseClass} ${activeTab === 'stats' ? 'border-b-purple-light text-purple-pale text-shadow-purple' : 'text-purple-pale/50 hover:text-purple-pale/85'}`}
						onClick={() => setActiveTab('stats')}
					>
						Stats
					</button>
					<button
						className={`${tabBaseClass} ${activeTab === 'achievements' ? 'border-b-purple-light text-purple-pale text-shadow-purple' : 'text-purple-pale/50 hover:text-purple-pale/85'}`}
						onClick={() => setActiveTab('achievements')}
					>
						Achievements
					</button>
					<button
						className={`${tabBaseClass} ${activeTab === 'friends' ? 'border-b-purple-light text-purple-pale text-shadow-purple' : 'text-purple-pale/50 hover:text-purple-pale/85'}`}
						onClick={() => setActiveTab('friends')}
					>
						Friends
					</button>
					<button
						className={`${tabBaseClass} ${activeTab === 'friend-requests' ? 'border-b-purple-light text-purple-pale text-shadow-purple' : 'text-purple-pale/50 hover:text-purple-pale/85'}`}
						onClick={() => setActiveTab('friend-requests')}
					>
						Friend Requests
					</button>
					{isOwnProfile && (
						<button
							className={`${tabBaseClass} ${activeTab === 'settings' ? 'border-b-purple-light text-purple-pale text-shadow-purple' : 'text-purple-pale/50 hover:text-purple-pale/85'}`}
							onClick={() => setActiveTab('settings')}
						>
							Settings
						</button>
					)}
				</div>

				<div className="profile-scrollbar flex-1 min-h-0 overflow-y-auto pr-2">
					{activeTab === 'stats' && (
						<ProfileStats stats={stats} />
					)}
					{activeTab === 'achievements' && (
						<ProfileAchievements stats={stats} />
					)}
					{activeTab === 'friends' && (
						<ProfileFriends />
					)}
					{activeTab === 'friend-requests' && (
						<ProfileFriendRequests />
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

			{error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
		</div>
	)
}

export default UserProfileView
