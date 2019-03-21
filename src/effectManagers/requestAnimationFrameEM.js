// @flow strict

import { makeCondition, makeEffectManager, EMRT } from '../epics'

type AfAType = {| dateNow: number, type: typeof afAT |}
type StateType = {| requestsByEpicVat: { [vat: string]: Request } |}
type ScopeType = {| resolvePromiseByEpicVat: { [vat: string]: () => void } |}
type RequestAnimationFrameEffectType = {| cmd: 'REQUEST' | 'CANCEL', type: typeof requestType |}

const afAT: 'af' = 'af'
const afAC = (dateNow: number): AfAType => ({ type: afAT, dateNow })
const requestType: 'request_animation_frame_effect' = 'request_animation_frame_effect'
const requestAnimationFrameEffectCreator = (): RequestAnimationFrameEffectType => ({ type: requestType, cmd: 'REQUEST' })
const cancelAnimationFrameEffectCreator = (): RequestAnimationFrameEffectType => ({	type: requestType, cmd: 'CANCEL' })
const rafEC = requestAnimationFrameEffectCreator
const cancelRafEC = cancelAnimationFrameEffectCreator


const animationFrameCondition = makeCondition<AfAType>(afAT)
const afC = animationFrameCondition
const requestAnimationFrameEM = makeEffectManager<RequestAnimationFrameEffectType, StateType, ScopeType>({
	requestType,
	initialState: { requestsByEpicVat: {} },
	initialScope: { resolvePromiseByEpicVat: {} },
	onEffectRequest: ({ effect, requesterEpicVat, state, scope, dispatch }) => {
		if (effect.cmd === 'REQUEST') {
			let rafId
			const promise = new Promise((resolve) => {
				const resolvePromise = () => {
					delete scope.resolvePromiseByEpicVat[requesterEpicVat]
					resolve()
				}

				rafId = window.requestAnimationFrame(() => {
					dispatch(afAC(Date.now()), { targetEpicVats: [requesterEpicVat] })
					resolvePromise()
				})
				scope.resolvePromiseByEpicVat[requesterEpicVat] = resolvePromise
			})

			return EMRT.updateStateWithEffectPromise({
				state: {
					...state,
					requestsByEpicVat: {
						...state.requestsByEpicVat,
						[requesterEpicVat]: rafId,
					},
				},
				promise,
			})
		} else if (effect.cmd === 'CANCEL') {
			window.cancelAnimationFrame(state.requestsByEpicVat[requesterEpicVat])
			scope.resolvePromiseByEpicVat[requesterEpicVat]()

			return EMRT.updateState({
				state:{
					...state,
					requestsByEpicVat: {
						...state.requestsByEpicVat,
						[requesterEpicVat]: null,
					},
				},
			})
		}
		return EMRT.doNothing
	},
})


export type { // eslint-disable-line import/group-exports
	RequestAnimationFrameEffectType,
}

export { // eslint-disable-line import/group-exports
	requestAnimationFrameEffectCreator,
	cancelAnimationFrameEffectCreator,
	rafEC,
	cancelRafEC,
	afC,
	requestAnimationFrameEM,
}
