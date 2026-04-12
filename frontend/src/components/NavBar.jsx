import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import PFP_Default from '../assets/PFP_Default.webp'

function NavBar() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, logout, isAuthenticated, authFetch } = useAuth()
	const [avatarUrl, setAvatarUrl] = useState(PFP_Default)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const sidebarRef = useRef(null)

	const fetchAvatar = () => {
		if (!user)
			return

		const playerRoute = '/api/players'

		authFetch(`${playerRoute}/${user.id}`)
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (data && data.pp_path && data.pp_path !== '/uploads/profilePictures/default_profile_picture.png')
					setAvatarUrl(`${playerRoute}/${user.id}/profile-picture?t=${Date.now()}`)
				else
					setAvatarUrl(PFP_Default)
			})
			.catch(() => setAvatarUrl(PFP_Default))
	}

	useEffect(() => {
		fetchAvatar()
	}, [user])

	// Re-fetch avatar when sidebar opens (picks up profile picture changes)
	useEffect(() => {
		if (sidebarOpen)
			fetchAvatar()
	}, [sidebarOpen])

	// Close sidebar on route change
	useEffect(() => {
		setSidebarOpen(false)
	}, [location.pathname])

	// Close sidebar on outside click
	useEffect(() => {
		if (!sidebarOpen)
			return
		const handleClick = (e) => {
			if (sidebarRef.current && !sidebarRef.current.contains(e.target))
				setSidebarOpen(false)
		}
		document.addEventListener('mousedown', handleClick)
		document.addEventListener('touchstart', handleClick)
		return () => {
			document.removeEventListener('mousedown', handleClick)
			document.removeEventListener('touchstart', handleClick)
		}
	}, [sidebarOpen])

	const handleLogout = async () => {
		setSidebarOpen(false)
		await logout()
		navigate('/')
	}

	return (
		<>
			{/* ─── Desktop NavBar (visible on screens >= 768px) ────────────── */}
			<nav className='sticky top-4 z-[100] mx-auto hidden w-[calc(100%-2rem)] max-w-[1200px] items-center justify-between rounded-2xl border border-purple-dim bg-card/80 px-6 py-3 shadow-[0_12px_40px_rgba(10,4,20,0.35)] backdrop-blur-2xl md:flex'>
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

			{/* ─── Desktop Footer (visible on screens >= 768px) ────────────── */}
			<footer className='fixed bottom-0 left-0 hidden w-full items-center justify-center gap-3 py-2 bg-[rgba(10,5,20,0.6)] backdrop-blur-md z-[100] md:flex'>
				<Link to="/privacy" className='text-[0.6rem] tracking-[0.1em] uppercase text-[rgba(220,190,255,0.4)] no-underline transition-colors duration-200 hover:text-[rgba(220,190,255,0.8)]'>Privacy Policy</Link>
				<span className='text-[rgba(220,190,255,0.2)] text-[0.6rem]'>|</span>
				<Link to="/terms" className='text-[0.6rem] tracking-[0.1em] uppercase text-[rgba(220,190,255,0.4)] no-underline transition-colors duration-200 hover:text-[rgba(220,190,255,0.8)]'>Terms of Service</Link>
			</footer>

			{/* ─── Mobile Top Bar (visible on screens < 768px) ─────────────── */}
			<div className='sticky top-0 z-[100] flex items-center justify-between bg-[rgba(10,5,20,0.85)] px-4 py-3 backdrop-blur-xl md:hidden'>
				<Link to="/" className='text-white text-[1.3rem] uppercase tracking-[0.18em] transition-colors hover:text-purple-hover'>
					Triple
				</Link>
				<button
					className='flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-purple-dim bg-transparent p-0 transition-all hover:border-purple-mid'
					onClick={() => setSidebarOpen(true)}
					aria-label="Open menu"
				>
					<span className='block h-[2px] w-5 rounded-full bg-purple-pale transition-all'></span>
					<span className='block h-[2px] w-5 rounded-full bg-purple-pale transition-all'></span>
					<span className='block h-[2px] w-5 rounded-full bg-purple-pale transition-all'></span>
				</button>
			</div>

			{/* ─── Mobile Sidebar Overlay (only on screens < 768px) ────────── */}
			{sidebarOpen && (
				<div className='fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm md:hidden'>
					<div
						ref={sidebarRef}
						className='absolute right-0 top-0 flex h-full w-[280px] max-w-[80vw] flex-col bg-[rgba(10,5,20,0.95)] shadow-[-8px_0_40px_rgba(0,0,0,0.5)] animate-[slide-in-right_0.25s_ease-out]'
					>
						{/* Close button */}
						<div className='flex justify-end p-4'>
							<button
								className='flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-transparent p-0 text-white/80 transition-colors hover:border-purple-mid hover:text-white'
								onClick={() => setSidebarOpen(false)}
								aria-label="Close menu"
							>
								✕
							</button>
						</div>

						{/* Profile section */}
						{isAuthenticated() && (
							<div className='flex flex-col items-center gap-3 border-b border-purple-dim px-6 pb-6'>
								<img src={avatarUrl} alt='Profile' className='h-16 w-16 rounded-full border-2 border-purple-mid shadow-[0_0_16px_rgba(192,96,255,0.4)]' />
								<span className='text-sm uppercase tracking-ui text-purple-pale'>{user.username}</span>
							</div>
						)}

						{/* Navigation links */}
						<nav className='flex flex-1 flex-col gap-1 px-4 py-6'>
							{isAuthenticated() ? (
								<>
									<Link to="/profile" className='flex items-center gap-3 rounded-lg px-4 py-3 text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:bg-purple-brand/15 hover:text-purple-pale'>
										Profile
									</Link>
									<Link to="/profile?tab=settings" className='flex items-center gap-3 rounded-lg px-4 py-3 text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:bg-purple-brand/15 hover:text-purple-pale'>
										Settings
									</Link>
									<Link to="/" className='flex items-center gap-3 rounded-lg px-4 py-3 text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:bg-purple-brand/15 hover:text-purple-pale'>
										Home
									</Link>
									<button
										onClick={handleLogout}
										className='mt-2 flex w-full items-center gap-3 rounded-lg border border-purple-dim bg-transparent px-4 py-3 text-left text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:border-purple-mid hover:bg-purple-brand/15 hover:text-purple-pale'
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link to="/login" className='flex items-center gap-3 rounded-lg px-4 py-3 text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:bg-purple-brand/15 hover:text-purple-pale'>
										Log in
									</Link>
									<Link to="/register" className='flex items-center gap-3 rounded-lg px-4 py-3 text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:bg-purple-brand/15 hover:text-purple-pale'>
										Register
									</Link>
								</>
							)}
						</nav>

						{/* Footer links (Privacy/Terms) */}
						<div className='flex flex-col gap-2 border-t border-purple-dim px-6 py-5'>
							<Link to="/privacy" className='text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(220,190,255,0.4)] transition-colors hover:text-[rgba(220,190,255,0.8)]'>
								Privacy Policy
							</Link>
							<Link to="/terms" className='text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(220,190,255,0.4)] transition-colors hover:text-[rgba(220,190,255,0.8)]'>
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default NavBar
