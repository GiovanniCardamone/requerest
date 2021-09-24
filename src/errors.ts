import RequeRest, { RequeRestOptions } from '.'

export class UnparsableResponseError extends Error {
	constructor(requerest: RequeRest, response: Response) {
		super(`failed request: ${requerest}`)
	}
}

export async function parseError(
	requerest: RequeRest,
	error: any
): Promise<never> {
	// pass

	throw new Error()
}
