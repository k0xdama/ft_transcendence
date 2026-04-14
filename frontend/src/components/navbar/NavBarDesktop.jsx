import { Link } from 'react-router-dom'

function NavBarDesktop({ isAuthenticated, user, avatarUrl, onLogout }) {
	return (
		<nav className='sticky top-4 z-[100] mx-auto hidden w-[calc(100%-2rem)] max-w-[1200px] items-center justify-between rounded-2xl border border-purple-dim bg-card/80 px-6 py-3 shadow-[0_12px_40px_rgba(10,4,20,0.35)] backdrop-blur-2xl md:flex'>
			<Link to="/" className='inline text-white text-[1.5rem] uppercase tracking-[0.18em] transition-colors hover:text-purple-hover'>
				Triple
			</Link>

			<div className='flex gap-8 flex-row items-center'>
				{isAuthenticated ? (
					<div className='flex items-center gap-3'>
						<img src={avatarUrl} alt='Profile' className='h-8 w-8 rounded-full border border-purple-mid shadow-[0_0_12px_rgba(192,96,255,0.35)]' />
						<span className='text-xs uppercase tracking-ui text-white/70'>
							Welcome, <Link to="/profile" className='text-purple-pale transition-colors hover:text-purple-light'>{user.username}</Link>
						</span>
						<button onClick={onLogout} className='rounded-lg border border-purple-dim bg-card px-3 py-1.5 text-[0.65rem] uppercase tracking-ui text-white/80 transition-all hover:border-purple-mid hover:bg-purple-brand/15'>
							Logout
						</button>
					</div>
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
	)
}

export default NavBarDesktop
