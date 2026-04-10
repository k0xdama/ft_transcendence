import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
// import './RegisterView.css'

function RegisterView() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword:''
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
		if (!emailRegex.test(formData.email)) {
			setError('Email must be valid');
			return;
		}

		if (formData.password.length < 8) {
			setError('Password must be 8 or more characters');
			return;
		}

		console.log('Validation passed ! Registration Data:', {formData});

		setLoading(true);

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: formData.email,
					username: formData.username,
					password: formData.password
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				setError(data.error || 'Registration failed');
				return;
			}

			setSuccess(data.message)

			setFormData({
				username: '',
				email: '',
				password: '',
				confirmPassword: ''
			});
			
			setTimeout(() => {navigate('/login')}, 1000);
		} catch (error) {
			console.error('Register error:', error);
			setError('Registration failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='w-[400px] rounded-2xl border border-purple-mid bg-card p-8 shadow-card backdrop-blur-3xl'>
			<h2 className='m-0 mb-6 text-center text-lg uppercase tracking-title text-purple-pale text-shadow-purple'>Create an account</h2>
			{error && <p className='mb-4 text-center text-xs uppercase tracking-ui text-red-400'>{error}</p>}
			{success && <p className='mb-4 text-center text-xs uppercase tracking-ui text-green-400'>{success}</p>}
			<form onSubmit={handleRegister} className='flex flex-col gap-3.5'>
				<div className='flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Username</label>
					<input name='username' value={formData.username} onChange={handleChange} disabled={loading} type="text" className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid' autoComplete='username' />
				</div>
				<div className='flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Email address</label>
					<input name='email' value={formData.email} onChange={handleChange} disabled={loading} type="text" className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid' autoComplete='email' />
				</div>
				<div className='flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Password</label>
					<input name='password' value={formData.password} onChange={handleChange} disabled={loading} type="password" className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid' autoComplete='new-password' />
				</div>
				<div className='flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Confirm password</label>
					<input name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} disabled={loading} type="password" className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid' autoComplete='new-password' />
				</div>
				<button className='mt-2 w-full rounded-lg border border-purple-mid/60 bg-purple-brand/20 px-5 py-2.5 text-xs uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/35 hover:shadow-btn-purple disabled:cursor-not-allowed disabled:opacity-60' type='submit' disabled={loading}>
					{loading ? 'Registering...' : 'Register'}
				</button>
			</form>
			<p className='mt-5 mb-0 text-center text-xs uppercase tracking-ui text-white/70'>
				Already have an account? <Link to="/login" className='text-purple-pale transition-colors hover:text-purple-light'>Sign in</Link>
			</p>
		</div>
	);
}

export default RegisterView;
