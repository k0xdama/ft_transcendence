import { Link } from 'react-router-dom'
// import './LegalView.css'

function PrivacyPolicyView() {
	return (
		<div className='flex w-full flex-col items-center gap-6 px-4 pt-4 pb-[60px] md:px-0 md:pt-10'>
			<div className='w-full max-w-[620px] rounded-2xl border border-purple-mid bg-card px-5 py-6 backdrop-blur-xl shadow-card md:px-11 md:py-9'>
				<h2 className='m-0 mb-1 text-center text-[1.1rem] uppercase tracking-title text-purple-pale text-shadow-purple'>Privacy Policy</h2>
				<p className='m-0 mb-7 text-center text-[0.65rem] uppercase tracking-[0.1em] text-white/40'>Last updated: April 2026</p>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>1. Data We Collect</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>When you create an account on Triple, we collect and store the following information:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Email address</span> — used to identify your account at login.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Username</span> — your public display name, visible to other players.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Password</span> — stored as a bcrypt hash. We never store or have access to your password in plain text.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Profile picture</span> — optionally uploaded by you. Stored on our server. A default avatar is used if none is provided.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Game statistics</span> — games played, victories, defeats, score, combos, and other gameplay metrics. Computed automatically after each game.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Chat messages</span> — messages sent in lobby and game rooms are stored for the duration of your account.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Friend list and block list</span> — relationships you create with other players.</li>
					</ul>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>2. Authentication Tokens</h3>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Access token</span> — a short-lived JWT (10 minutes), stored in a secure httpOnly cookie. Used to authenticate your requests.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Refresh token</span> — stored as a SHA-256 hash in our database, valid for 7 days. Automatically rotated on each refresh.</li>
					</ul>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>Both tokens are transmitted via httpOnly cookies and are not accessible to JavaScript running in your browser.</p>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>3. How We Use Your Data</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>Your data is used exclusively to provide the Triple game service:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li>Authenticate you and maintain your session.</li>
						<li>Display your profile and statistics to you and other players.</li>
						<li>Enable in-game chat and social features (friends, blocking).</li>
						<li>Compute and display achievements based on your game history.</li>
					</ul>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>We do <strong>not</strong> use your data for advertising, analytics, tracking, or any purpose other than operating the game.</p>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>4. Data Sharing</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>We do <strong>not</strong> share, sell, or transfer your personal data to any third party. All data remains within the Triple infrastructure.</p>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>5. Data Retention</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>Your data is retained indefinitely for as long as your account exists. When you delete your account, all associated data is permanently removed, including:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li>Your profile, email, and username</li>
						<li>Your profile picture (file deleted from the server)</li>
						<li>Your game statistics</li>
						<li>Your friend and block relationships</li>
					</ul>
				</section>

				<section>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>6. Your Rights</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>You have the right to:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Access</span> your data — your profile page displays all information we hold about you.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Modify</span> your data — you can change your username, email, and profile picture from your profile settings at any time.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Delete</span> your data — you can permanently delete your account and all associated data from your profile settings.</li>
					</ul>
				</section>

				<div className='mt-8 flex justify-center gap-6 border-t border-purple-mid/50 pt-5'>
					<Link to="/terms" className='text-[0.72rem] uppercase tracking-[0.1em] text-cyan-glow no-underline transition-colors duration-200 hover:text-cyan-glow hover:text-shadow-cyan'>Terms of Service</Link>
					<Link to="/" className='text-[0.72rem] uppercase tracking-[0.1em] text-cyan-glow no-underline transition-colors duration-200 hover:text-cyan-glow hover:text-shadow-cyan'>Back to Home</Link>
				</div>
			</div>
		</div>
	)
}

export default PrivacyPolicyView
