import RequeRest, { HeadersObject } from './index'

export function encodeBody(requerest: RequeRest, body?: unknown): any {
	if (body === undefined) {
		return undefined
	}

	if (requerest.options.encode in requerest.options.encoders === false) {
		throw new Error(
			`missing encoder ${requerest.options.encode}. Available encoders: ${requerest.options.encoders}`
		)
	}

	return requerest.options.encoders[requerest.options.encode](body)
}

export function encodeHeaders(
	requerest: RequeRest,
	headers?: HeadersObject
): any {
	if (headers === undefined) {
		return undefined
	}

	return Object.entries(headers).reduce((acc, [key, val]) => {
		if (val !== undefined) {
			acc[key] = val
		}

		return acc
	}, {} as HeadersObject)
}
