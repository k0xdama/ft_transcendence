import { ValidationError } from './errors.js';

export function validateEmail(email) {
	if (!email)
		throw new ValidationError('Email is required');

	const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

	if (!emailRegex.test(email))
		throw new ValidationError('Invalid email format');
  
	if (email.length > 254)
		throw new ValidationError('Email too long (max 254 characters)');	// RFC 5321
}

export function validateUsername(username) {
	if (!username)
		throw new ValidationError('Username is required');

	if (username.length < 3 || username.length > 50)
		throw new ValidationError('Username must be between 3 and 50 characters');


	const usernameRegex = /^[A-Za-z0-9_-]+$/;

	if (!usernameRegex.test(username))
		throw new ValidationError('Username can only contain letters, numbers, hyphens and underscores');
}

export function validatePassword(password) {
	if (!password)
		throw new ValidationError('Password is required');
	if (password.length < 8)
		throw new ValidationError('Password must be at least 8 characters');

	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const hasSpecial = /[!@#$%^&*(),.?"_\-:{}|<>]/.test(password);

	if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecial))
		throw new ValidationError('Password must contain uppercase, lowercase, number and special character');
}