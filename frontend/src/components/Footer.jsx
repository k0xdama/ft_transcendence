import { Link } from 'react-router-dom'
import { LEGAL_LINKS } from '../constants/NavConstants'

function Footer() {
	return (
		<footer className='fixed bottom-0 left-0 hidden w-full items-center justify-center gap-3 py-2 bg-[rgba(10,5,20,0.6)] backdrop-blur-md z-[100] md:flex'>
			{LEGAL_LINKS.map(({ to, label }, i) => (
				<span key={to} className='contents'>
					{i > 0 && <span className='text-[rgba(220,190,255,0.2)] text-[0.6rem]'>|</span>}
					<Link to={to} className='text-[0.6rem] tracking-[0.1em] uppercase text-[rgba(220,190,255,0.4)] no-underline transition-colors duration-200 hover:text-[rgba(220,190,255,0.8)]'>
						{label}
					</Link>
				</span>
			))}
		</footer>
	)
}

export default Footer
