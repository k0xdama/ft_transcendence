import { Link } from 'react-router-dom'
import './LegalView.css'

function TermsOfServiceView() {
	return (
		<div className='legal-view'>
			<div className='legal-card'>
				<h2 className='legal-title'>Terms of Service</h2>
				<p className='legal-updated'>Last updated: April 2026</p>

				<section className='legal-section'>
					<h3 className='legal-heading'>1. Eligibility</h3>
					<p>To use Triple, you must:</p>
					<ul className='legal-list'>
						<li>Be at least <strong>16 years of age</strong>.</li>
						<li>Use the Service as a natural person (individual). Corporations, limited liability companies, partnerships, and other legal entities or commercial organizations are not permitted to create accounts.</li>
						<li>Not have been previously banned from using the Service by Triple.</li>
					</ul>
					<p>By creating an account, you confirm that you meet all of the above requirements.</p>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>2. Account Responsibility</h3>
					<p>You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. If you suspect unauthorized access, you should change your password immediately.</p>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>3. Prohibited Conduct</h3>
					<p>The following behaviors are strictly prohibited:</p>
					<ul className='legal-list'>
						<li><span className='legal-highlight'>Cheating</span> — exploiting bugs, using automated tools, bots, or any means to gain an unfair advantage in games.</li>
						<li><span className='legal-highlight'>Harassment</span> — threatening, bullying, or engaging in abusive behavior toward other players, whether through chat messages, usernames, or any other means.</li>
						<li><span className='legal-highlight'>Impersonation</span> — pretending to be another user, a moderator, or any person or entity you are not.</li>
						<li><span className='legal-highlight'>Disruption</span> — intentionally disrupting games, lobbies, or the experience of other players.</li>
						<li><span className='legal-highlight'>Abuse of the service</span> — attempting to access unauthorized data, attack the infrastructure, or circumvent security measures.</li>
					</ul>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>4. Enforcement</h3>
					<p>If you violate these Terms of Service, Triple reserves the right to:</p>
					<ul className='legal-list'>
						<li><strong>Suspend</strong> your account temporarily.</li>
						<li><strong>Permanently delete</strong> your account and all associated data.</li>
					</ul>
					<p>Enforcement actions are taken at our sole discretion and are not subject to appeal.</p>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>5. Limitation of Liability</h3>
					<p>Triple is a <strong>school project</strong> developed as part of the 42 curriculum. The Service is provided "as is" without warranty of any kind, express or implied.</p>
					<ul className='legal-list'>
						<li>We do not guarantee uninterrupted or error-free operation of the Service.</li>
						<li>We are not responsible for any loss of data, including game statistics or account information.</li>
						<li>The Service may be discontinued at any time without prior notice.</li>
						<li>We are not liable for any damages arising from the use or inability to use the Service.</li>
					</ul>
				</section>

				<section className='legal-section'>
					<h3 className='legal-heading'>6. Modifications</h3>
					<p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
				</section>

				<div className='legal-footer'>
					<Link to="/privacy" className='legal-link'>Privacy Policy</Link>
					<Link to="/" className='legal-link'>Back to Home</Link>
				</div>
			</div>
		</div>
	)
}

export default TermsOfServiceView
