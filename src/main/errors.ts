import { BaseError } from '@nodescript/errors';

export class InvalidSpecError extends BaseError {
    override status = 400;
}

export class InvalidAiResponseError extends BaseError {

    constructor(message: string, public details: any) {
        super(message);
    }
}

export class UnsupportedFeatureError extends BaseError {}
