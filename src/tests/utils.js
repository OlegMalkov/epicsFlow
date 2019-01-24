// @flow
import type { EpicsStore } from '../epics'

const timeoutSymbol = Symbol('timeout')
export const waitEffectManagers = async (
	store: EpicsStore<Object>, 
	singleEffectTimeout?: number = 100
) => {
	let 
		i, 
		pendingEffectsPromises = store.getAllPendingEffectsPromises()
        
	while (pendingEffectsPromises.length) {
		for (i = 0; i < pendingEffectsPromises.length; i++) {
			const timeoutPromise = new Promise((resolve) => { setTimeout(() => resolve(timeoutSymbol), singleEffectTimeout) })
			const { promise, requestEffectType, effect } = pendingEffectsPromises[i]
			const resolution = await Promise.race([promise, timeoutPromise])
			if (resolution === timeoutSymbol) {
				const errMsg = `Effect ${requestEffectType} timeout`
				store.warn(errMsg, effect)
				throw new Error(errMsg)
			}
		}
		pendingEffectsPromises = store.getAllPendingEffectsPromises()
	}
}