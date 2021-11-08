import RequeRest from './index'

export function encodeBody(requerest: RequeRest, body: unknown): any {
	if (requerest.options.encode in requerest.options.encoders === false) {
		throw new Error(
			`missing encoder ${requerest.options.encode}. Available encoders: ${requerest.options.encoders}`
		)
	}

	return requerest.options.encoders[requerest.options.encode](body)
}
