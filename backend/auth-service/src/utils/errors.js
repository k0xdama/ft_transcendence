class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.reason = message;
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends AppError {
	constructor(message = 'Validation failed') {
		super(message, 400);
	}
}

export class EmailAlreadyExistsError extends AppError {
	constructor(message = 'This email is linked to an existing account') {
		super(message, 400);
	}
}

export class UsernameAlreadyExistsError extends AppError {
	constructor(message = 'This username is already taken') {
		super(message, 400);
	}
}

export class InvalidCredentialsError extends AppError {
	constructor(message = 'Invalid credentials') {
		super(message, 401);
	}
}

export class UserNotFoundError extends AppError {
	constructor(message = 'User not found') {
		super(message, 404);
	}
}