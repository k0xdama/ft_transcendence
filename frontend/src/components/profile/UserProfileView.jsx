import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import ProfileHeader from './ProfileHeader'
import ProfileStats from './ProfileStats'
import ProfileAchievements from './ProfileAchievements'
import ProfileFriends from './ProfileFriends'
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
			// todo: Peut etre Mettre des donnees par defaut en cas de fail de fetch pour eviter les trous
			const response = await fetch(`/api/players/${targetUserId}`)
			if (!response.ok) {
				throw new Error('Failed to fetch profile data')
			}
			const playerData = await response.json()

			setProfileData({
				id: playerData.auth_user_id,
				username: playerData.username,
				email: playerData.email,
				avatarUrl: (playerData.pp_path && playerData.pp_path !== '/uploads/profilePictures/default_profile_picture.png') ? `/api/players/${targetUserId}/profile-picture` : null,
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
			const response = await fetch(`/api/players/${targetUserId}`)
			
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
			const formData = new FormData()
			formData.append('profilePicture', file)  // Clé attendue par upload.single('profilePicture')

			const response = await authFetch(`/api/players/me/profile-picture`, {
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
				avatarUrl: `/api/players/${user.id}/profile-picture`
			}))
		} catch (err) {
			console.error('Avatar upload error:', err)
			setError('Failed to upload avatar')
		}
	}

	const handleAvatarDelete = async () => {
		try {
			const response = await authFetch(`/api/players/me/profile-picture`, {
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
			//todo: WARN AUSSI MODIF la requete fetch pour qu'elle modifie le username email et mdp de l'auth et sa bdd
			//todo: aussi permettre la modif du mot de passe
			const response = await fetch(`/api/players/${user.id}`, {
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
			//todo: modif la requete pour supprimer de l'auth aussi 

			const response = await fetch(`/api/players/${user.id}`, {
				method: 'DELETE'
			})

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
					<button
						className={`profile-tab ${activeTab === 'friends' ? 'active' : ''}`}
						onClick={() => setActiveTab('friends')}
					>
						Friends
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
					{activeTab === 'friends' && (
						<ProfileFriends />
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
