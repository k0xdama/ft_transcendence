import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import PFP_Default from '../assets/PFP_Default.webp'
import NavBarDesktop from './navbar/NavBarDesktop'
import NavBarMobile from './navbar/NavBarMobile'

const PLAYER_ROUTE = '/api/players'
const DEFAULT_PP_PATH = '/uploads/profilePictures/default_profile_picture.png'

function NavBar() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, logout, isAuthenticated, authFetch, avatarVersion } = useAuth()
	const [avatarUrl, setAvatarUrl] = useState(PFP_Default)
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const fetchAvatar = () => {
		if (!user)
			return

		authFetch(`${PLAYER_ROUTE}/${user.id}`)
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (data && data.pp_path && data.pp_path !== DEFAULT_PP_PATH)
					setAvatarUrl(`${PLAYER_ROUTE}/${user.id}/profile-picture?t=${Date.now()}`)
				else
					setAvatarUrl(PFP_Default)
			})
			.catch(() => setAvatarUrl(PFP_Default))
	}

	useEffect(() => {
		fetchAvatar()
	}, [user, avatarVersion])

	// Re-fetch avatar when sidebar opens (picks up profile picture changes)
	useEffect(() => {
		if (sidebarOpen)
			fetchAvatar()
	}, [sidebarOpen])

	// Close sidebar on route change
	useEffect(() => {
		setSidebarOpen(false)
	}, [location.pathname])

	const handleLogout = async () => {
		setSidebarOpen(false)
		await logout()
		navigate('/')
	}

	const authed = isAuthenticated()

	return (
		<>
			<NavBarDesktop
				isAuthenticated={authed}
				user={user}
				avatarUrl={avatarUrl}
				onLogout={handleLogout}
			/>
			<NavBarMobile
				isAuthenticated={authed}
				user={user}
				avatarUrl={avatarUrl}
				onLogout={handleLogout}
				sidebarOpen={sidebarOpen}
				onOpenSidebar={() => setSidebarOpen(true)}
				onCloseSidebar={() => setSidebarOpen(false)}
			/>
		</>
	)
}

export default NavBar
