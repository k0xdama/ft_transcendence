import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

function NavBar() {
	const navigate = useNavigate()
	const {user, logout, isAuthenticated} = useAuth()

	const handleLogout = () => {
		logout()
		navigate('/')
	}

	return (
		<nav className='navbar'>
			<div className='brand'>
				<Link to="/">Trois Cartes</Link>
			</div>

			<div className='navControl'>
				{isAuthenticated() ? (
					<>
						<span className='welcome-mess'>
							Welcome, <Link to="/profile" className='prof'>{user.username}</Link> !
						</span>
						<button onClick={handleLogout} className='logout-btn'>Logout</button>
					</>
				) : (
					<>
						<Link to="/login">
							<div className='log-btn'>Log in</div>
						</Link>
						<Link to="/register">
							<button className='reg-btn'>Register</button>
						</Link>
					</>
				)}
			</div>
		</nav>
	)
}

export default NavBar
