// @flow strict

import { createEvent } from '../../../../../src/epics'
import { type ParticipantType } from '../types'

const SignedInEvent = createEvent<{| userName: string |}>('SIGNED_IN')
const DbParticipantsUpdatedEvent = createEvent<{| participants: Array<ParticipantType> |}>('DB_PARTICIPANTS_UPDATED')

export {
	SignedInEvent,
	DbParticipantsUpdatedEvent,
}
