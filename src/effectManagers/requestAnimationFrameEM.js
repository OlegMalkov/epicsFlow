// @flow strict

import { type MakeCondition, type MakeEffectManager, type EMRTType } from '../epics'
const afAT: 'af' = 'af'

type afA = {| type: typeof afAT, dateNow: number |}

const afAC = (dateNow: number): afA => ({ type: afAT, dateNow })

type Request = {| |}
type State = {| requestsByEpicVat: { [vat: string]: Request } |}
type Scope = {| resolvePromiseByEpicVat: { [vat: string]: () => void } |}
const requestType: 'request_animation_frame_effect' = 'request_animation_frame_effect'
export type RequestAnimationFrameEffect = {|
	type: typeof requestType,
	cmd: 'REQUEST' | 'CANCEL'
|}

export const 
	requestAnimationFrameEffectCreator = (): RequestAnimationFrameEffect => ({
		type: requestType,
		cmd: 'REQUEST'
	}),
	cancelAnimationFrameEffectCreator = (): RequestAnimationFrameEffect => ({
		type: requestType,
		cmd: 'CANCEL'
	}),
	rafEC = requestAnimationFrameEffectCreator,
	cancelRafEC = cancelAnimationFrameEffectCreator

type Props = { makeCondition: MakeCondition, makeEffectManager: MakeEffectManager, EMRT: EMRTType }
export function initRequestAnimationFrameEM({ makeCondition, makeEffectManager, EMRT }: Props) {
	const
		animationFrameCondition = makeCondition<afA>(afAT),
		afC = animationFrameCondition,
		requestAnimationFrameEM = makeEffectManager<RequestAnimationFrameEffect, State, Scope>({
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
								[requesterEpicVat]: rafId
							}
						},
						promise
					})
				} else if (effect.cmd === 'CANCEL') {
					window.cancelAnimationFrame(state.requestsByEpicVat[requesterEpicVat])
					scope.resolvePromiseByEpicVat[requesterEpicVat]()
                
					return EMRT.updateState({
						state:{
							...state,
							requestsByEpicVat: { 
								...state.requestsByEpicVat,
								[requesterEpicVat]: null
							}
						}
					})
				}
				return EMRT.doNothing
			}
		})

	return {
		animationFrameCondition,
		afC,
		requestAnimationFrameEM
	}
}