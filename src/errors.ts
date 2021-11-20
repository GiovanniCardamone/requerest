import { HttpError } from 'http-class'
import RequeRest from './index'

class BaseError extends Error {
	constructor(
		readonly statusCode: number,
		readonly name: string,
		message: string,
		readonly data?: { [key: string]: any }
	) {
		super(message)
	}
}

export class UnprocessableRequestError extends BaseError {
	constructor(message: string) {
		super(-1, 'UnprocessableRequest', message)
	}
}

export class UnparsableResponseError extends BaseError {
	constructor(requerest: RequeRest, response: Response) {
		super(-1, 'UnparsableResponse', `failed request: ${requerest}`)
	}
}

export class HttpResponseError extends BaseError implements HttpError {
	constructor(
		readonly statusCode: number,
		name: string,
		message: string,
		readonly data?: { [key: string]: any }
	) {
		super(statusCode, name, message, data)
	}

	static async from(response: Response) {
		const payload = await response.json()
		return new HttpError(
			response.status,
			payload.name,
			payload.message,
			payload.data
		)
	}
}
