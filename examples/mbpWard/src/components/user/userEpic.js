// @flow strict

import { createEpic, createUpdater } from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { SignedInEvent } from '../firebase/firebaseEvents'

type UserStateType = {|
	userName: null | string,
|}

const setUserName = setProp<UserStateType, *>('userName')

const userEpic = createEpic<UserStateType, empty, empty>({
	vcet: 'USER_VCET',
	initialState: { userName: null },
	updaters: {
		signedIn: createUpdater({
			given: {},
			when: {
				data: SignedInEvent.condition,
			},
			then: ({ R, values: { data: { userName } } }) => R.mapState(setUserName(userName)),
		}),
	},
})

// eslint-disable-next-line import/group-exports
export {
	userEpic,
}

// eslint-disable-next-line import/group-exports
export type {
	UserStateType,
}
