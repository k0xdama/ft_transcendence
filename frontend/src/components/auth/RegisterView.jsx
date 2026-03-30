import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import './RegisterView.css'

function RegisterView() {
	const navigate = useNavigate()	
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword:''
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState('')

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleRegister = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match')
			return
		}

		const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
		if (!emailRegex.test(formData.email)) {
			setError('Email must be valid')
			return
		}

		if (formData.password.length < 8) {
			setError('Password must be 8 or more characters')
			return
		}

		else {
			console.log('Validation passed ! Registration Data:', {formData})
		}

		setLoading(true)

		try {
			const authUrl = '/api/auth'
			const response = await fetch(`${authUrl}/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: formData.email,
					username: formData.username,
					password: formData.password
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				setError(data.error || 'Registration failed')
				return
			}

			setSuccess(data.message)

			setFormData({
				username: '',
				email: '',
				password: '',
				confirmPassword: ''
			})
			
			setTimeout(() => {navigate('/login')}, 1000)
		} catch (error) {
			console.error('Register error:', error)
			setError('Registration failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='registerView'>
			<h2 className='title'>Create a new account</h2>
			{error && <div className='error'>{error}</div>}
			{success && <div className='success'> {success}</div>}
			<form onSubmit={handleRegister}>
				<div className='inputs'>
					<label>Username:</label>
					<input name= 'username' value={formData.username} onChange={handleChange} disabled={loading} type="text" className='inputField'/>
					<label>Email address:</label>
					<input name= 'email' value={formData.email} onChange={handleChange} disabled={loading} type="text" className='inputField'/>
					<label>Password:</label>
					<input name= 'password' value={formData.password} onChange={handleChange} disabled={loading} type="password" className='passInput'/>
					<label>Confirm password:</label>
					<input name= 'confirmPassword' value={formData.confirmPassword} onChange={handleChange} disabled={loading} type="password" className='passInput'/>
				</div>
				<button className='comBut'
				type='submit'
				disabled={loading}
				>
					{loading ? 'Registering...' : 'Register'}
				</button>
			</form>
			<p>Already have an account? <Link to="/login">Sign in</Link></p>
		</div>
	);
}

export default RegisterView
