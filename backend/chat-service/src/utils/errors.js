class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.reason = message;
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class MissingFieldError extends AppError {
	constructor(field) {
		super(`${field} is required`, 400);
	}
}

export class InvalidFieldError extends AppError {
	constructor(detail) {
		super(detail, 400);
	}
}

export class CannotBlockSelfError extends AppError {
	constructor(message = 'You cannot block yourself') {
		super(message, 400);
	}
}

export class NotLobbyMemberError extends AppError {
	constructor(message = 'You are not a member of this lobby') {
		super(message, 403);
	}
}

export class LobbyServiceUnavailableError extends AppError {
	constructor(message = 'Lobby service unavailable') {
		super(message, 503);
	}
}

export class CannotDMSelfError extends AppError {
	constructor(message = 'You cannot DM yourself') {
		super(message, 400);
	}
}