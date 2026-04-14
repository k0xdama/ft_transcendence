import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
	AUTH_LINKS,
	GUEST_LINKS,
	LEGAL_LINKS,
	SIDEBAR_LINK_CLASS
} from '../../constants/NavConstants'
import { IconClose } from '../icons/Icons'

function NavBarMobile({
	isAuthenticated,
	user,
	avatarUrl,
	onLogout,
	sidebarOpen,
	onOpenSidebar,
	onCloseSidebar
}) {
	const sidebarRef = useRef(null)

	// Close sidebar on outside click (touch + mouse).
	useEffect(() => {
		if (!sidebarOpen)
			return
		const handleClick = (e) => {
			if (sidebarRef.current && !sidebarRef.current.contains(e.target))
				onCloseSidebar()
		}
		document.addEventListener('mousedown', handleClick)
		document.addEventListener('touchstart', handleClick)
		return () => {
			document.removeEventListener('mousedown', handleClick)
			document.removeEventListener('touchstart', handleClick)
		}
	}, [sidebarOpen, onCloseSidebar])

	const links = isAuthenticated ? AUTH_LINKS : GUEST_LINKS

	return (
		<>
			<div className='sticky top-0 z-[100] flex items-center justify-between bg-[rgba(10,5,20,0.85)] px-4 py-3 backdrop-blur-xl md:hidden'>
				<Link to="/" className='text-white text-[1.3rem] uppercase tracking-[0.18em] transition-colors hover:text-purple-hover'>
					Triple
				</Link>
				<button
					className='flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-purple-dim bg-transparent p-0 transition-all hover:border-purple-mid'
					onClick={onOpenSidebar}
					aria-label="Open menu"
				>
					<span className='block h-[2px] w-5 rounded-full bg-purple-pale transition-all'></span>
					<span className='block h-[2px] w-5 rounded-full bg-purple-pale transition-all'></span>
					<span className='block h-[2px] w-5 rounded-full bg-purple-pale transition-all'></span>
				</button>
			</div>

			{sidebarOpen && (
				<div className='fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm md:hidden'>
					<div
						ref={sidebarRef}
						className='absolute right-0 top-0 flex h-full w-[280px] max-w-[80vw] flex-col bg-[rgba(10,5,20,0.95)] shadow-[-8px_0_40px_rgba(0,0,0,0.5)] animate-[slide-in-right_0.25s_ease-out]'
					>
						<div className='flex justify-end p-4'>
							<button
								className='flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-transparent p-0 text-white/80 transition-colors hover:border-purple-mid hover:text-white'
								onClick={onCloseSidebar}
								aria-label="Close menu"
							>
								<IconClose />
							</button>
						</div>

						{isAuthenticated && (
							<div className='flex flex-col items-center gap-3 border-b border-purple-dim px-6 pb-6'>
								<img src={avatarUrl} alt='Profile' className='h-16 w-16 rounded-full border-2 border-purple-mid shadow-[0_0_16px_rgba(192,96,255,0.4)]' />
								<span className='text-sm uppercase tracking-ui text-purple-pale'>{user.username}</span>
							</div>
						)}

						<nav className='flex flex-1 flex-col gap-1 px-4 py-6'>
							{links.map(({ to, label }) => (
								<Link key={to} to={to} className={SIDEBAR_LINK_CLASS}>{label}</Link>
							))}
							{isAuthenticated && (
								<button
									onClick={onLogout}
									className={`mt-2 w-full border border-purple-dim bg-transparent text-left hover:border-purple-mid ${SIDEBAR_LINK_CLASS}`}
								>
									Logout
								</button>
							)}
						</nav>

						<div className='flex flex-col gap-2 border-t border-purple-dim px-6 py-5'>
							{LEGAL_LINKS.map(({ to, label }) => (
								<Link key={to} to={to} className='text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(220,190,255,0.4)] transition-colors hover:text-[rgba(220,190,255,0.8)]'>
									{label}
								</Link>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default NavBarMobile
