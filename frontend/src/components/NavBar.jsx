import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import PFP_Default from '../assets/PFP_Default.webp'
// import './NavBar.css'

function NavBar() {
	const navigate = useNavigate()
	const { user, logout, isAuthenticated, authFetch } = useAuth()
	const [avatarUrl, setAvatarUrl] = useState(PFP_Default)

	useEffect(() => {
		if (!user)
			return

		const playerRoute = '/api/players'

		authFetch(`${playerRoute}/${user.id}`)
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (data && data.pp_path && data.pp_path !== '/uploads/profilePictures/default_profile_picture.png')
					setAvatarUrl(`${playerRoute}/${user.id}/profile-picture`)
				else
					setAvatarUrl(PFP_Default)
			})
			.catch(() => setAvatarUrl(PFP_Default))
	}, [user])

	const handleLogout = async () => {
		await logout()
		navigate('/')
	}

	return (
		<>
			<nav className='sticky top-4 z-[100] mx-auto flex w-[calc(100%-2rem)] max-w-[1200px] items-center justify-between rounded-2xl border border-purple-dim bg-card/80 px-6 py-3 shadow-[0_12px_40px_rgba(10,4,20,0.35)] backdrop-blur-2xl'>
				<Link to="/" className='inline text-white text-[1.5rem] uppercase tracking-[0.18em] transition-colors hover:text-purple-hover'>
					Triple
				</Link>

				<div className='flex gap-8 flex-row items-center'>
					{isAuthenticated() ? (
						<>
							<div className='flex items-center gap-3'>
								<img src={avatarUrl} alt='Profile' className='h-8 w-8 rounded-full border border-purple-mid shadow-[0_0_12px_rgba(192,96,255,0.35)]' />
								<span className='text-xs uppercase tracking-ui text-white/70'>
									Welcome, <Link to="/profile" className='text-purple-pale transition-colors hover:text-purple-light'>{user.username}</Link>
								</span>
								<button onClick={handleLogout} className='rounded-lg border border-purple-dim bg-card px-3 py-1.5 text-[0.65rem] uppercase tracking-ui text-white/80 transition-all hover:border-purple-mid hover:bg-purple-brand/15'>
									Logout
								</button>
							</div>
						</>
					) : (
						<>
							<Link to="/login" className='inline text-xs uppercase tracking-ui text-white/70 transition-colors hover:text-purple-pale'>Log in</Link>
							<Link to="/register">
								<button className='rounded-lg border border-purple-mid/70 bg-purple-brand/25 px-4 py-1.5 text-[0.65rem] uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/40 hover:shadow-btn-purple'>Register</button>
							</Link>
						</>
					)}
				</div>
			</nav>

			<footer className='fixed bottom-0 left-0 w-full flex justify-center items-center gap-3 py-2 bg-[rgba(10,5,20,0.6)] backdrop-blur-md z-[100]'>
				<Link to="/privacy" className='text-[0.6rem] tracking-[0.1em] uppercase text-[rgba(220,190,255,0.4)] no-underline transition-colors duration-200 hover:text-[rgba(220,190,255,0.8)]'>Privacy Policy</Link>
				<span className='text-[rgba(220,190,255,0.2)] text-[0.6rem]'>|</span>
				<Link to="/terms" className='text-[0.6rem] tracking-[0.1em] uppercase text-[rgba(220,190,255,0.4)] no-underline transition-colors duration-200 hover:text-[rgba(220,190,255,0.8)]'>Terms of Service</Link>
			</footer>
		</>
	)
}

export default NavBar
