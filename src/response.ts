import type RequeRest from './index'
import { UnparsableResponseError, HttpResponseError } from './errors'

export interface RequeRestResponse<T> {
	status: number
	headers: Headers
	data: T
}

export async function parseResponse<T>(
	requerest: RequeRest,
	response: Response
): Promise<RequeRestResponse<T>> {
	if (response.status >= 200 && response.status < 300) {
		if (
			requerest.options.decode === undefined ||
			response.headers
				.get('content-type')
				?.toLowerCase()
				.startsWith(requerest.options.decode?.toLocaleLowerCase()) === false
		) {
			throw new UnparsableResponseError(requerest, response)
		}

		return {
			status: response.status,
			headers: response.headers,
			data: (await requerest.options.decoders[requerest.options.decode](
				response
			)) as unknown as T,
		}
	}

	throw await HttpResponseError.from(response)
}
