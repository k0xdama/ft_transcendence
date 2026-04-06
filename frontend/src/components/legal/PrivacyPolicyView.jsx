import { Link } from 'react-router-dom'
import './LegalView.css'

function PrivacyPolicyView() {
	return (
		<div className='legal-view'>
			<div className='legal-card'>
				<h2 className='legal-title'>Privacy Policy</h2>
				<p className='legal-updated'>Last updated: April 2026</p>

				<section className='legal-section'>
					<h3 className='legal-heading'>1. Data We Collect</h3>
					<p>When you create an account on Triple, we collect and store the following information:</p>
					<ul className='legal-list'>
						<li><span className='legal-highlight'>Email address</span> — used to identify your account at login.</li>
						<li><span className='legal-highlight'>Username</span> — your public display name, visible to other players.</li>
						<li><span className='legal-highlight'>Password</span> — stored as a bcrypt hash. We never store or have access to your password in plain text.</li>
						<li><span className='legal-highlight'>Profile picture</span> — optionally uploaded by you. Stored on our server. A default avatar is used if none is provided.</li>
						<li><span className='legal-highlight'>Game statistics</span> — games played, victories, defeats, score, combos, and other gameplay metrics. Computed automatically after each game.</li>
						<li><span className='legal-highlight'>Chat messages</span> — messages sent in lobby and game rooms are stored for the duration of your account.</li>
						<li><span className='legal-highlight'>Friend list and block list</span> — relationships you create with other players.</li>
					</ul>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>2. Authentication Tokens</h3>
					<ul className='legal-list'>
						<li><span className='legal-highlight'>Access token</span> — a short-lived JWT (10 minutes), stored in a secure httpOnly cookie. Used to authenticate your requests.</li>
						<li><span className='legal-highlight'>Refresh token</span> — stored as a SHA-256 hash in our database, valid for 7 days. Automatically rotated on each refresh.</li>
					</ul>
					<p>Both tokens are transmitted via httpOnly cookies and are not accessible to JavaScript running in your browser.</p>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>3. How We Use Your Data</h3>
					<p>Your data is used exclusively to provide the Triple game service:</p>
					<ul className='legal-list'>
						<li>Authenticate you and maintain your session.</li>
						<li>Display your profile and statistics to you and other players.</li>
						<li>Enable in-game chat and social features (friends, blocking).</li>
						<li>Compute and display achievements based on your game history.</li>
					</ul>
					<p>We do <strong>not</strong> use your data for advertising, analytics, tracking, or any purpose other than operating the game.</p>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>4. Data Sharing</h3>
					<p>We do <strong>not</strong> share, sell, or transfer your personal data to any third party. All data remains within the Triple infrastructure.</p>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>5. Data Retention</h3>
					<p>Your data is retained indefinitely for as long as your account exists. When you delete your account, all associated data is permanently removed, including:</p>
					<ul className='legal-list'>
						<li>Your profile, email, and username</li>
						<li>Your profile picture (file deleted from the server)</li>
						<li>Your game statistics</li>
						<li>Your friend and block relationships</li>
					</ul>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>6. Your Rights</h3>
					<p>You have the right to:</p>
					<ul className='legal-list'>
						<li><span className='legal-highlight'>Access</span> your data — your profile page displays all information we hold about you.</li>
						<li><span className='legal-highlight'>Modify</span> your data — you can change your username, email, and profile picture from your profile settings at any time.</li>
						<li><span className='legal-highlight'>Delete</span> your data — you can permanently delete your account and all associated data from your profile settings.</li>
					</ul>
				</section>

				<div className='legal-footer'>
					<Link to="/terms" className='legal-link'>Terms of Service</Link>
					<Link to="/" className='legal-link'>Back to Home</Link>
				</div>
			</div>
		</div>
	)
}

export default PrivacyPolicyView
