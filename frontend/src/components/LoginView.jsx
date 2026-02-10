import { Link } from 'react-router-dom'
import { use, useState } from 'react';
import './LoginView.css'

function LoginView() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	})

	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleLogin = async (e) => {
		e.preventDefault()

		if (!formData.password || !formData.username)
		{
			setError('Please enter username/email and password')
			return
		}

		setLoading(true)

		try {
			//REPLACE BY AUTH SERVICE API CALL
			await new Promise(resolve => setTimeout(resolve, 2000))
			console.log('Log in successful!', {formData})
		} catch (error) {
			setError('Invalid username/email or password')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='loginView'>
			<h2 className='title'>Log in</h2>
			{error && <div className='error'>{error}</div>}
			<div className='inputs'>
				<label>Username:</label>
				<input name= 'username' value={formData.username} onChange={handleChange} disabled={loading} type="text" className='inputField'/>
				<label>Password:</label>
				<input name= 'password' value={formData.password} onChange={handleChange} disabled={loading} type="password" className='passInput'/>
			</div>
			<button className='comBut'
			onClick={handleLogin}
			disabled={loading}
			>
				{loading ? 'Logging in...' : 'Log in'}
			</button>
			<p>Don't have an account? <Link to="/register">Sign up</Link></p>
		</div>
	);
}

export default LoginView
