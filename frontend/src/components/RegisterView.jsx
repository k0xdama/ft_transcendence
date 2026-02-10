import { Link } from 'react-router-dom'
import { use, useState } from 'react';
import './RegisterView.css'

function RegisterView() {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword:''
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleRegister = async (e) => {
		e.preventDefault()
		setError('')

		if (formData.password !== formData.confirmPassword)
		{
			setError('Passwords do not match')
			return
		}
		if (!formData.email.includes('@'))
		{
			setError('Email must be valid')
			return
		}
		else
		{
			console.log('Validation passed ! Registration Data:', {formData})
		}

		setLoading(true)

		try {
			//REPLACE BY AUTH SERVICE API CALL
			await new Promise(resolve => setTimeout(resolve, 2000))
			console.log('Registration successful!')
		} catch (error) {
			setError('Resgistration Failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='registerView'>
			<h2 className='title'>Create a new account</h2>
			{error && <div className='error'>{error}</div>}
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
			onClick={handleRegister}
			disabled={loading}
			>
				{loading ? 'Registering...' : 'Register'}
			</button>
			<p>Already have an account? <Link to="/login">Sign in</Link></p>
		</div>
	);
}

export default RegisterView
