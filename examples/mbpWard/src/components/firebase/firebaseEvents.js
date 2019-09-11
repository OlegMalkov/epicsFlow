// @flow strict

import { createEvent } from '../../../../../src/epics'

const SignedInEvent = createEvent<{| userName: string |}>('SIGNED_IN')

export {
	SignedInEvent,
}
