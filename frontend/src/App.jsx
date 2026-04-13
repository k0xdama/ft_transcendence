import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import HomeView from './components/HomeView'
import NavBar from './components/NavBar'
import RegisterView from './components/auth/RegisterView'
import LoginView from './components/auth/LoginView'
import JoinGameView from './components/lobby/JoinGameView'
import UserProfileView from './components/profile/UserProfileView'
import LobbyView from './components/lobby/LobbyView'
import GameView from './components/gameboard/GameView'
import PublicMatchmakingView from './components/matchmaking/PublicMatchmakingView'
import WaitingMatchmakingView from './components/matchmaking/WaitingMatchmakingView'
import PrivacyPolicyView from './components/legal/PrivacyPolicyView'
import TermsOfServiceView from './components/legal/TermsOfServiceView'
import CreateLobbyView from './components/lobby/CreateLobbyView'
import DMChatOverlay from './components/chat/DMChatOverlay'
import HowToPlayView from './components/HowToPlayView'

const PAGE_TITLES = {
	'/': 'Home',
	'/login': 'Log in',
	'/register': 'Register',
	'/join': 'Join Game',
	'/profile': 'Profile',
	'/lobby/new': 'Create Lobby',
	'/matchmaking': 'Matchmaking',
	'/matchmaking/waiting': 'Matchmaking',
	'/privacy': 'Privacy Policy',
	'/terms': 'Terms of Service',
}

function App() {
	const [ backendStatus, setBackendStatus ] = useState(null)
	const [ loading, setLoading ] = useState(true)
	const [ error, setError ] = useState(null)
	const [ currentView, setCurrentView ] = useState('home')
	const { user, logout, isAuthenticated } = useAuth()
	const location = useLocation()

	useEffect(() => {
		const path = location.pathname

		let title = PAGE_TITLES[path]
		if (!title) {
			if (path.startsWith('/lobby/')) {
				title = 'Lobby'
			}
			else if (path.startsWith('/game/')) {
				title = 'Game'
			}
			else if (path.startsWith('/profile/')) {
				title = 'Profile'
			}
		}
		document.title = title
			? `Triple — ${title}`
			: 'Triple'
	}, [location.pathname])

	const handleNav = (viewName) => {
		setCurrentView(viewName)
	}

	const isGamePage = location.pathname.startsWith('/game/')

	return (
		<>
			<NavBar />

			<div className='mx-auto p-8 text-center flex justify-center items-center min-h-[calc(100vh-100px)]'>
				<Routes>
					<Route path="/" element={<HomeView />} />
					<Route path="/join" element={<JoinGameView />} />
					<Route path="/register" element={<RegisterView />} />
					<Route path="/login" element={<LoginView />} />
					<Route path="/profile" element={<UserProfileView />} />
					<Route path="/profile/:userId" element={<UserProfileView />}/>
					<Route path="/lobby/new" element={<CreateLobbyView />} />
					<Route path="/lobby/:lobbyId" element={<LobbyView />} />
					<Route path="/game/:gameId" element={<GameView />} />
					<Route path="/matchmaking" element={<PublicMatchmakingView />} />
					<Route path="/matchmaking/waiting" element={<WaitingMatchmakingView />} />
					<Route path="/how_to_play" element={<HowToPlayView />} />
					<Route path="/privacy" element={<PrivacyPolicyView />} />
					<Route path="/terms" element={<TermsOfServiceView />} />
					<Route path="*" element={
						<div className="flex flex-col items-center gap-4">
							<p className="text-lg font-bold uppercase tracking-ui text-purple-pale">Page not found</p>
							<a href="/" className="text-xs uppercase tracking-ui text-purple-pale/50 hover:text-purple-pale transition-colors">Back to home</a>
						</div>
					} />
				</Routes>
			</div>

			{!isGamePage && <DMChatOverlay />}
		</>
	)
}

export default App
