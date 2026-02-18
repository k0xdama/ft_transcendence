import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginView.css'

function LoginView() {
	const navigate = useNavigate()
	const { login } = useAuth()

	const [formData, setFormData] = useState({
		id: '',
		password: '',
	})

	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleLogin = async (e) => {
		e.preventDefault()

		if (!formData.password || !formData.id)
		{
			setError('Please enter username/email and password')
			return
		}

		setLoading(true)

		try {
			const response = await fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier: formData.id,
					password: formData.password
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				setError(data.error || 'Log in failed')
				return
			}

			setSuccess(data.message)

			login(data.user, data.accessToken)

			setFormData({
				id: '',
				password: ''
			})
			
			setTimeout(() => {navigate('/')}, 2000)
		} catch (error) {
			console.error('Log in error:', error)
			setError('Log in failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='loginView'>
			<h2 className='title'>Log in</h2>
			{error && <div className='error'>{error}</div>}
			{success && <div className='success'>{success}</div>}
			<div className='inputs'>
				<label>Username/Email:</label>
				<input name= 'id' value={formData.id} onChange={handleChange} disabled={loading} type="text" className='inputField'/>
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
