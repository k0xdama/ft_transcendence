import { Link } from 'react-router-dom'
import './RegisterView.css'

function RegisterView() {
	return (
		<div className='registerView'>
			<h2 className='title'>Create a new account</h2>
			<div className='inputs'>
				<label>Username:</label>
				<input type="text" className='inputField'/>
				<label>Email address:</label>
				<input type="text" className='inputField'/>
				<label>Password:</label>
				<input type="password" className='passInput'/>
				<label>Confirm password:</label>
				<input type="password" className='passInput'/>
			</div>
			<button className='comBut'>Register</button>
		</div>
	);
}

export default RegisterView
