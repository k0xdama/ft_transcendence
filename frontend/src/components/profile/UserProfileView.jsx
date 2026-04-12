import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileStats from './ProfileStats'
import ProfileAchievements from './ProfileAchievements'
import ProfileFriends from './ProfileFriends'
import ProfileFriendRequests from './ProfileFriendRequests'
import ProfileSettings from './ProfileSettings'
import DeleteAccountModal from './DeleteAccountModal'
import { useDM } from '../../context/DMContext'

function UserProfileView() {
	const { userId } = useParams()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { user, isAuthenticated, authFetch, logout, updateUser } = useAuth()
	const { openDM } = useDM()
	const playerRoute = '/api/players'

	const [activeTab, setActiveTab] = useState(() => {
		const tab = searchParams.get('tab')
		return ['stats', 'achievements', 'friends', 'friend-requests', 'settings'].includes(tab) ? tab : 'stats'
	})
	const [profileData, setProfileData] = useState(null)
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [friendStatus, setFriendStatus] = useState(null) // 'friend', 'pending', 'none', 'blocked'
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const tabBaseClass = 'shrink-0 !rounded-none !bg-transparent !border-0 border-b-2 border-b-transparent px-3 py-2 text-[0.64rem] uppercase tracking-ui cursor-pointer transition-colors whitespace-nowrap focus:outline-none focus-visible:outline-none md:w-full md:shrink md:px-2'

	const isOwnProfile = !userId || (user && userId === user.id)
	const targetUserId = userId || (user && user.id)

	// Sync active tab with ?tab= query param
	useEffect(() => {
		const tab = searchParams.get('tab')
		if (tab && ['stats', 'achievements', 'friends', 'friend-requests', 'settings'].includes(tab))
			setActiveTab(tab)
	}, [searchParams])

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
			const response = await authFetch(`${playerRoute}/${targetUserId}`)
			if (!response.ok)
				throw new Error('Failed to fetch profile data')

			const playerData = await response.json()

			setProfileData({
				id: playerData.auth_user_id,
				username: playerData.username,
				// email is owned by auth-service and only available for the current user via JWT
				email: isOwnProfile
					? (user && user.email)
					: null,
				avatarUrl: (playerData.pp_path && playerData.pp_path !== '/uploads/profilePictures/default_profile_picture.png')
					? `${playerRoute}/${targetUserId}/profile-picture`
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
			const response = await authFetch(`${playerRoute}/${targetUserId}`)
			if (!response.ok)
				throw new Error('Failed to fetch stats')
			
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
			// Check if blocked
			const blockedRes = await authFetch(`${playerRoute}/me/blocked`)
			if (blockedRes?.ok) {
				const blockedData = await blockedRes.json()
				const isBlocked = blockedData.blocked?.some(b => b.auth_user_id === targetUserId)
				if (isBlocked) {
					setFriendStatus('blocked')
					return
				}
			}

			// Check if already friends
			const friendsRes = await authFetch(`${playerRoute}/me/friends`)
			if (friendsRes?.ok) {
				const friendsData = await friendsRes.json()
				const isFriend = friendsData.friends?.some(f => f.auth_user_id === targetUserId)
				if (isFriend) {
					setFriendStatus('friend')
					return
				}
			}

			// Check if pending request sent
			const sentRes = await authFetch(`${playerRoute}/me/friend-requests/sent`)
			if (sentRes?.ok) {
				const sentData = await sentRes.json()
				const isPending = sentData.requests?.some(r => r.auth_user_id === targetUserId)
				if (isPending) {
					setFriendStatus('pending')
					return
				}
			}

			setFriendStatus('none')
		} catch (err) {
			console.error('Failed to fetch friend status:', err)
			setFriendStatus('none')
		}
	}

	const handleAddFriend = async () => {
		try {
			const response = await authFetch(`${playerRoute}/me/friend-requests/${targetUserId}`, {
				method: 'POST'
			})
			if (!response.ok)
				throw new Error('Failed to send friend request')

			setFriendStatus('pending')
		} catch (err) {
			setError('Failed to send friend request')
		}
	}

	const handleRemoveFriend = async () => {
		try {
			const response = await authFetch(`${playerRoute}/me/friends/${targetUserId}`, {
				method: 'DELETE'
			})
			if (!response.ok)
				throw new Error('Failed to remove friend')

			setFriendStatus('none')
		} catch (err) {
			setError('Failed to remove friend')
		}
	}

	const handleBlock = async () => {
		try {
			const response = await authFetch(`${playerRoute}/me/blocked/${targetUserId}`, {
				method: 'POST'
			})
			if (!response.ok)
				throw new Error('Failed to block user')

			setFriendStatus('blocked')
		} catch (err) {
			setError('Failed to block user')
		}
	}

	const handleAvatarUpload = async (file) => {
		try {
			const formData = new FormData()
			formData.append('profilePicture', file)  // Clé attendue par upload.single('profilePicture')

			const response = await authFetch(`${playerRoute}/me/profile-picture`, {
				method: 'POST',
				body: formData
				// NE PAS mettre de Content-Type, le navigateur le met automatiquement
			})
			if (!response.ok)
				throw new Error('Upload failed')

			await response.json()
			setProfileData(prev => ({
				...prev,
				avatarUrl: `${playerRoute}/${user.id}/profile-picture`
			}))
		} catch (err) {
			console.error('Avatar upload error:', err)
			setError('Failed to upload avatar')
		}
	}

	const handleAvatarDelete = async () => {
		try {
			const response = await authFetch(`${playerRoute}/me/profile-picture`, {
				method: 'DELETE'
			})
			if (!response.ok)
				throw new Error('Delete failed')

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
			const response = await authFetch(`${playerRoute}/me`, {
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

			if (field === 'username')
				updateUser({ username: updatedData[field] })

			return { success: true }
		} catch (err) {
			console.error('Error updating profile:', err)
			return { success: false, error: err.message }
		}
	}

	const handleDeleteAccount = async () => {
		try {
			//todo: reverif que tout est dans la norme ca coute rien
			const response = await authFetch(`${playerRoute}/me`, {
				method: 'DELETE'
			})
			if (!response.ok)
				throw new Error('Failed to delete account')

			await logout()
			navigate('/')
		} catch (err) {
			setError('Failed to delete account', err)
		}
	}

	if (!isAuthenticated())
		return <Navigate to="/login" />

	if (loading) {
		return (
			<div className="flex flex-col items-center pt-4 gap-4 w-full px-4 md:pt-10 md:gap-6 md:px-0">
				<div className="flex flex-col bg-card border border-purple-mid rounded-2xl p-4 w-full max-w-[620px] h-[75vh] backdrop-blur-3xl shadow-card md:p-8 md:h-[62vh]">
					<p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading profile...</p>
				</div>
			</div>
		)
	}

	if (error && !profileData) {
		return (
			<div className="flex flex-col items-center pt-4 gap-4 w-full px-4 md:pt-10 md:gap-6 md:px-0">
				<div className="flex flex-col bg-card border border-purple-mid rounded-2xl p-4 w-full max-w-[620px] h-[75vh] backdrop-blur-3xl shadow-card md:p-8 md:h-[62vh]">
					<p className="text-red-500 text-xs text-center mt-2">{error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center pt-4 gap-4 w-full px-4 md:pt-10 md:gap-6 md:px-0">
			<div className="flex flex-col bg-card border border-purple-mid rounded-2xl p-4 w-full max-w-[620px] h-[75vh] backdrop-blur-3xl shadow-card md:p-8 md:h-[62vh]">
				<ProfileHeader
					profileData={profileData}
					isOwnProfile={isOwnProfile}
					friendStatus={friendStatus}
					onAvatarUpload={handleAvatarUpload}
					onAvatarDelete={handleAvatarDelete}
					onAddFriend={handleAddFriend}
					onRemoveFriend={handleRemoveFriend}
					onBlock={handleBlock}
					onSendMessage={() => openDM(targetUserId, profileData.username, profileData.avatarUrl)}
				/>

				<div className={`mb-5 flex w-full overflow-x-auto gap-1 border-b border-purple-dim pb-1 md:grid ${isOwnProfile ? 'md:grid-cols-5' : 'md:grid-cols-4'} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
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
