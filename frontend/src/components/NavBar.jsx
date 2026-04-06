import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PFP_Default from '../assets/PFP_Default.webp'
import './NavBar.css'

function NavBar() {
	const navigate = useNavigate()
	const { user, logout, isAuthenticated } = useAuth()

	const handleLogout = async () => {
		await logout()
		navigate('/')
	}

	return (
		<>
			<nav className='navbar'>
				<div className='brand'>
					<Link to="/">Triple</Link>
				</div>

				<div className='navControl'>
					{isAuthenticated() ? (
						<>
							<div className='user-profile'>
								<img src={PFP_Default} alt='Profile' className='profile-pic' />
								<span className='welcome-mess'>
									Welcome, <Link to="/profile" className='prof'>{user.username}</Link> !
								</span>
								<p onClick={handleLogout} className='logout-btn'>Logout</p>
							</div>
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

			<footer className='navbar-footer'>
				<Link to="/privacy" className='footer-link'>Privacy Policy</Link>
				<span className='footer-sep'>|</span>
				<Link to="/terms" className='footer-link'>Terms of Service</Link>
			</footer>
		</>
	)
}

export default NavBar
