import { Link } from 'react-router-dom'
import './NavBar.css'

function NavBar() {
	return (
		<nav className='navbar'>
			<div className='brand'>
				<Link to="/">Garou Loup</Link>
			</div>

			<div className='navControl'>
				<Link to="/login">
					<div className='logBut'>Log in</div>
				</Link>
				<Link to="/register">
					<button className='regBut'>Register</button>
				</Link>
			</div>
		</nav>
	)
}

export default NavBar
