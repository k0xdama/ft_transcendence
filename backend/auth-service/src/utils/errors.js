class AppError extends Error {
	constructor(detail, statusCode) {
		super(detail);
		this.detail = detail;
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

class ValidationError extends AppError {
	constructor(detail = 'Validation failed') {
		super(detail, 400);
		this.code = 'VALIDATION_ERROR';
	}
}

class EmailAlreadyExistsError extends AppError {
	constructor(detail = 'This email is linked to an existing account') {
		super(detail, 400);
		this.code = 'EMAIL_EXISTS';
	}
}

class UsernameAlreadyExistsError extends AppError {
	constructor(detail = 'This username is already taken') {
		super(detail, 400);
		this.code = 'USERNAME_EXISTS';
	}
}

class InvalidCredentialsError extends AppError {
	constructor(detail = 'Invalid credentials') {
		super(detail, 401);
		this.code = 'INVALID_CREDENTIALS';
	}
}

// TO DELETE BEFORE CORRECTION --> use InvalidCredentialsError instead
class UserNotFoundError extends AppError {
	constructor(detail = 'User not found') {
		super(detail, 401);
		this.code = 'USER_NOT_FOUND';
	}
}

// TO DELETE BEFORE CORRECTION --> use InvalidCredentialsError instead
class InvalidPasswordError extends AppError {
	constructor(detail = 'Invalid password') {
		super(detail, 401);
		this.code = 'INVALID_PASSWORD';
	}
}

export {
	AppError,
	ValidationError,
	EmailAlreadyExistsError,
	UsernameAlreadyExistsError,
	InvalidCredentialsError,
	UserNotFoundError,
	InvalidPasswordError
};