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

export class BlockedUserMessageError extends AppError {
	constructor(message = 'This message cannot be delivered') {
		super(message, 403);
	}
}

export class NotLobbyMemberError extends AppError {
	constructor(message = 'You are not a member of this lobby') {
		super(message, 403);
	}
}

export class CannotDMSelfError extends AppError {
	constructor(message = 'You cannot DM yourself') {
		super(message, 400);
	}
}

export class DMConversationNotFoundError extends AppError {
	constructor(message = 'DM conversation not found') {
		super(message, 404);
	}
}

export class NotConversationMemberError extends AppError {
	constructor(message = 'You are not a member of this conversation') {
		super(message, 403);
	}
}