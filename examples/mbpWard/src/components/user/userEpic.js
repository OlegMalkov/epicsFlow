// @flow strict

import { createEpic, createUpdater, dispatchMsgEffectCreator, type BuiltInEffectType } from '../../../../../src/epics'
import { setProp } from '../../../../../src/utils'
import { SignedInEvent } from '../firebase/firebaseEvents'
import { WorkspaceOpenFileCmd } from '../workspace/workspaceMsgs'
import { getQueryVariable } from '../utils'

type UserStateType = {|
	userName: null | string,
|}

const setUserName = setProp<UserStateType, *>('userName')

const userEpic = createEpic<UserStateType, BuiltInEffectType, empty>({
	vcet: 'USER_VCET',
	initialState: { userName: null },
	updaters: {
		signedIn: createUpdater({
			given: {},
			when: {
				data: SignedInEvent.condition,
			},
			then: ({ R, values: { data: { userName } } }) => {
				let result = R.mapState(setUserName(userName))

				const participantId = getQueryVariable('participantId')
				const fileName = getQueryVariable('fileName')

				if (fileName) {
					result = result.sideEffect(dispatchMsgEffectCreator(WorkspaceOpenFileCmd.create({ fileName, participantId })))
				}

				return result
			},
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
