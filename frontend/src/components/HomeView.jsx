import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuBtn = 'w-full rounded-lg border border-purple-mid/50 bg-card px-6 py-3 text-xs uppercase tracking-ui text-white/85 transition-all hover:border-purple-mid hover:bg-purple-brand/15'

function HomeView() {
	const { isAuthenticated } = useAuth()

	return (
		<div className="flex min-h-[calc(100vh-170px)] w-full flex-col items-center justify-center">
			<div className="relative w-full max-w-[560px] rounded-3xl border border-purple-mid bg-[rgba(10,5,20,0.72)] px-6 py-8 shadow-card backdrop-blur-3xl md:px-10 md:py-10">
				<div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(192,96,255,0.12),transparent_60%)]" />

				<div className="relative z-10 flex flex-col items-center">
					<h1 className="mb-6 text-[3rem] text-white text-shadow-[0_0_12px_rgba(11,25,105,0.8),0_0_28px_rgba(11,25,105,0.65)] md:mb-8 md:text-[4.6rem]">
						Triple
					</h1>

					<div className="mx-auto flex w-full max-w-[260px] flex-col justify-center gap-4">
						{isAuthenticated() ? (
							<>
								<Link to="/lobby/new" className={menuBtn}>Create game</Link>
								<Link to="/join" className={menuBtn}>Join game</Link>
								<Link
									to="/matchmaking"
									className="w-full rounded-lg border border-cyan-mid bg-card px-6 py-3 text-xs uppercase tracking-ui text-cyan-glow transition-all hover:border-cyan-str hover:bg-cyan-glow/15 text-center"
								>
									Public match
								</Link>
								<Link to="/how_to_play" className={menuBtn}>How to play</Link>
							</>
						) : (
							<>
								<Link to="/login" className={menuBtn}>Log in</Link>
								<Link to="/register" className={menuBtn}>Register</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default HomeView
