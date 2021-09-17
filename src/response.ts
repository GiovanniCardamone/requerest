import type RequeRest from '.'
import { UnparsableResponseError } from './errors'

export async function parseResponse<T>(
	requerest: RequeRest,
	response: Response
): Promise<T> {
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

		return requerest.options.decoders[requerest.options.decode] as unknown as T
	}

	throw new Error(await response.text())
}
