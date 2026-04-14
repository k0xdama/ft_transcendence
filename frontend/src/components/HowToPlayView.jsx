import { Link } from 'react-router-dom'

function HowToPlayView() {
	const partTitleClass = 'mb-3 rounded-lg border border-purple-mid/70 bg-purple-brand/15 px-3.5 py-2 text-[0.8rem] uppercase tracking-[0.1em] text-purple-pale'
	const partListClass = 'm-0 mb-2.5 list-none space-y-1.5 pl-0 font-sans text-[0.75rem] leading-[1.6] text-[#dcbeffb3]'
	const compactListClass = 'm-0 list-none space-y-1.5 pl-0 font-sans text-[0.75rem] leading-[1.6] text-[#dcbeffb3]'

	return (
		<div className='flex w-full flex-col items-center gap-6 px-4 pt-4 pb-[60px] md:px-0 md:pt-10'>
			<div className='w-full max-w-[720px] rounded-2xl border border-purple-mid bg-card px-5 py-6 backdrop-blur-xl shadow-card md:px-11 md:py-9'>
				<h2 className='m-0 mb-1 text-center text-[1.1rem] uppercase tracking-title text-purple-pale text-shadow-purple'>How To Play</h2>
				<p className='m-0 mb-7 text-center text-[0.65rem] uppercase tracking-[0.1em] text-white/40'>Learn the rules of Triple</p>

				<section className='mb-7'>
					<div className={partTitleClass}>1. Setup</div>
					<p className='m-0 mb-3 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>
						The number of cards dealt to each player and placed in the middle depends on the number of players:
					</p>
					<div className='overflow-hidden rounded-lg border border-purple-dim'>
						<table className='w-full border-collapse font-sans text-[0.75rem] text-[#dcbeffb3]'>
							<thead>
								<tr className='bg-white/5 text-purple-pale'>
									<th className='border-b border-purple-dim px-3.5 py-2 text-left uppercase tracking-[0.1em]'>Players</th>
									<th className='border-b border-purple-dim px-3.5 py-2 text-center uppercase tracking-[0.1em]'>Cards in the Middle</th>
									<th className='border-b border-purple-dim px-3.5 py-2 text-center uppercase tracking-[0.1em]'>Cards per Player</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 font-bold text-purple-pale'>3</td>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 text-center'>9</td>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 text-center'>9</td>
								</tr>
								<tr>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 font-bold text-purple-pale'>4</td>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 text-center'>8</td>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 text-center'>7</td>
								</tr>
								<tr>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 font-bold text-purple-pale'>5</td>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 text-center'>6</td>
									<td className='border-b border-purple-dim/60 px-3.5 py-2 text-center'>6</td>
								</tr>
								<tr>
									<td className='px-3.5 py-2 font-bold text-purple-pale'>6</td>
									<td className='px-3.5 py-2 text-center'>6</td>
									<td className='px-3.5 py-2 text-center'>5</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<section className='mb-7'>
					<div className={partTitleClass}>2. Objective</div>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>
						Each player's goal is to form <strong className='text-white/90'>triples</strong> — sets of three cards of the same value. Every turn is an opportunity to complete a triple.
					</p>
				</section>

				<section className='mb-7'>
					<div className={partTitleClass}>3. Turn Structure</div>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>
						Players take turns. On their turn, a player must choose <strong className='text-white/90'>one</strong> of the following three actions:
					</p>
					<ul className={partListClass}>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Ask for the highest card</span> from any player.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Ask for the lowest card</span> from any player.</li>
						<li><span className='font-bold tracking-[0.04em] text-purple-pale'>Flip a card</span> from the middle.</li>
					</ul>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>
						A player is allowed to target <strong className='text-white/90'>themselves</strong> when asking for a card.
					</p>
				</section>

				<section className='mb-7'>
					<div className={partTitleClass}>4. Revealing Cards</div>
					<ul className={partListClass}>
						<li>A player is allowed to reveal <span className='font-bold tracking-[0.04em] text-purple-pale'>up to two cards</span> per turn.</li>
						<li>If the two revealed cards form <span className='font-bold tracking-[0.04em] text-purple-pale'>a pair</span>, the player may reveal a <span className='font-bold tracking-[0.04em] text-purple-pale'>third card</span> to attempt to complete <span className='font-bold tracking-[0.04em] text-purple-pale'>the triple.</span></li>
						<li>Any card flipped from the middle remains <span className='font-bold tracking-[0.04em] text-purple-pale'>visible to everyone</span> for the duration of that turn.</li>
					</ul>
				</section>

				<section className='mb-7'>
					<div className={partTitleClass}>5. Failing a Turn</div>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>
						If the player fails to reveal two or three matching cards, all revealed cards are returned <strong className='text-white/90'>face-down to their original location</strong>, and play passes to the next player.
					</p>
				</section>

				<section className='mb-7'>
					<div className={partTitleClass}>6. Empty Hand</div>
					<p className='m-0 mb-2.5 font-sans text-[0.78rem] leading-[1.7] text-[#dcbeffbf]'>
						A player who has run out of cards <strong className='text-white/90'>continues to play normally</strong>. They can still ask other players for cards or flip cards from the middle.
					</p>
				</section>

				<section>
					<div className={partTitleClass}>7. Win Conditions</div>

					<div className='mb-4 rounded-lg border border-purple-mid/60 bg-purple-brand/15 px-4 py-3'>
						<h4 className='m-0 mb-2 text-[0.75rem] uppercase tracking-[0.1em] text-purple-pale'>Normal Mode</h4>
						<p className='m-0 mb-2 font-sans text-[0.75rem] leading-[1.6] text-[#dcbeffbf]'>A player wins if <span className='font-bold'>either</span> condition is met:</p>
						<ul className={compactListClass}>
							<li>Forming <span className='font-bold tracking-[0.04em] text-purple-pale'>3 triples</span>, or</li>
							<li>Forming the <span className='font-bold tracking-[0.04em] text-cyan-glow text-shadow-cyan'>triple of 7s</span>.</li>
						</ul>
					</div>

					<div className='rounded-lg border border-cyan-mid bg-btn-cyan px-4 py-3'>
						<h4 className='m-0 mb-2 text-[0.75rem] uppercase tracking-[0.1em] text-cyan-glow text-shadow-cyan'>Linked Mode</h4>
						<p className='m-0 mb-2 font-sans text-[0.75rem] leading-[1.6] text-[#dcbeffbf]'>The win conditions change:</p>
						<ul className={compactListClass}>
							<li>Each triple is <span className='font-bold tracking-[0.04em] text-purple-pale'>linked</span> to 1 or 2 other triples.</li>
							<li>A player wins by completing <span className='font-bold tracking-[0.04em] text-purple-pale'>2 linked triples</span>.</li>
							<li>As in Normal Mode, finding the <span className='font-bold tracking-[0.04em] text-cyan-glow text-shadow-cyan'>triple of 7s</span> also ends the game instantly.</li>
						</ul>
					</div>
				</section>

				<div className='mt-8 flex justify-center gap-6 border-t border-purple-mid/50 pt-5'>
					<Link to="/" className='text-[0.72rem] uppercase tracking-[0.1em] text-cyan-glow no-underline transition-colors duration-200 hover:text-cyan-glow hover:text-shadow-cyan'>Back to Home</Link>
				</div>
			</div>
		</div>
	)
}

export default HowToPlayView
