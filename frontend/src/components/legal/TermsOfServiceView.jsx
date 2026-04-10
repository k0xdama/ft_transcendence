import { Link } from 'react-router-dom'
// import './LegalView.css'

function TermsOfServiceView() {
	return (
		<div className='flex w-full flex-col items-center gap-6 pt-10 pb-[60px]'>
			<div className='w-[620px] max-w-[90vw] rounded-2xl border border-purple-mid bg-card px-11 py-9 backdrop-blur-xl shadow-card'>
				<h2 className='m-0 mb-1 text-center text-[1.1rem] uppercase tracking-title text-purple-pale text-shadow-purple'>Terms of Service</h2>
				<p className='m-0 mb-7 text-center text-[0.65rem] uppercase tracking-[0.1em] text-white/40'>Last updated: April 2026</p>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>1. Eligibility</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>To use Triple, you must:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li>Be at least <strong>16 years of age</strong>.</li>
						<li>Use the Service as a natural person (individual). Corporations, limited liability companies, partnerships, and other legal entities or commercial organizations are not permitted to create accounts.</li>
						<li>Not have been previously banned from using the Service by Triple.</li>
					</ul>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>By creating an account, you confirm that you meet all of the above requirements.</p>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>2. Account Responsibility</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. If you suspect unauthorized access, you should change your password immediately.</p>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>3. Prohibited Conduct</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>The following behaviors are strictly prohibited:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Cheating</span> — exploiting bugs, using automated tools, bots, or any means to gain an unfair advantage in games.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Harassment</span> — threatening, bullying, or engaging in abusive behavior toward other players, whether through chat messages, usernames, or any other means.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Impersonation</span> — pretending to be another user, a moderator, or any person or entity you are not.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Disruption</span> — intentionally disrupting games, lobbies, or the experience of other players.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Abuse of the service</span> — attempting to access unauthorized data, attack the infrastructure, or circumvent security measures.</li>
					</ul>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>4. Enforcement</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>If you violate these Terms of Service, Triple reserves the right to:</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li><strong>Suspend</strong> your account temporarily.</li>
						<li><strong>Permanently delete</strong> your account and all associated data.</li>
					</ul>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>Enforcement actions are taken at our sole discretion and are not subject to appeal.</p>
				</section>

				<section className='mb-7'>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>5. Limitation of Liability</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>Triple is a <strong>school project</strong> developed as part of the 42 curriculum. The Service is provided "as is" without warranty of any kind, express or implied.</p>
					<ul className='m-0 mb-2.5 flex list-none flex-col gap-2 p-0 [&>li]:rounded-lg [&>li]:border [&>li]:border-purple-dim [&>li]:bg-white/5 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-sans [&>li]:text-[0.75rem] [&>li]:leading-[1.6] [&>li]:text-[#dcbeffb3] [&>li_strong]:text-white/90'>
						<li>We do not guarantee uninterrupted or error-free operation of the Service.</li>
						<li>We are not responsible for any loss of data, including game statistics or account information.</li>
						<li>The Service may be discontinued at any time without prior notice.</li>
						<li>We are not liable for any damages arising from the use or inability to use the Service.</li>
					</ul>
				</section>

				<section>
					<h3 className='m-0 mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'>6. Modifications</h3>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
				</section>

				<div className='mt-8 flex justify-center gap-6 border-t border-purple-mid/50 pt-5'>
					<Link to="/privacy" className='text-[0.72rem] uppercase tracking-[0.1em] text-cyan-glow no-underline transition-colors duration-200 hover:text-cyan-glow hover:text-shadow-cyan'>Privacy Policy</Link>
					<Link to="/" className='text-[0.72rem] uppercase tracking-[0.1em] text-cyan-glow no-underline transition-colors duration-200 hover:text-cyan-glow hover:text-shadow-cyan'>Back to Home</Link>
				</div>
			</div>
		</div>
	)
}

export default TermsOfServiceView
