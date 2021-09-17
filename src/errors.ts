import RequeRest, { RequeRestOptions } from '.'

export class UnparsableResponseError extends Error {
	constructor(requerest: RequeRest, response: Response) {
		super(`failed request: ${requerest}`)
	}
}

export class MissingEncoderError extends Error {
	constructor(requerest: RequeRest, type: RequeRestOptions['encode']) {
		super(
			`parser error: no encoder "${type}", availables: ${Object.keys(
				requerest.options.decoders ?? []
			)}`
		)
	}
}

export class MissingDecoderError extends Error {
	constructor(requerest: RequeRest, type: RequeRestOptions['encode']) {
		super(
			`parser error: no decoder "${type}", availables: ${Object.keys(
				requerest.options.encoders ?? []
			)}`
		)
	}
}
