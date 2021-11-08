import { HttpError } from 'http-class'
import RequeRest from './index'

export class UnparsableResponseError extends Error {
	constructor(requerest: RequeRest, response: Response) {
		super(`failed request: ${requerest}`)
	}
}

export class HttpResponseError extends Error implements HttpError {
	constructor(
		readonly statusCode: number,
		name: string,
		message: string,
		readonly data?: { [key: string]: any }
	) {
		super(`${name} (${statusCode}): ${message}`)
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
