// @flow

import { deepEqual } from './epics'

const T = () => true
const F = () => false

type SetPropType = <S: {}, P: $Keys<S>>(propName: P) => (valueUpdater: $ElementType<S, P> | $ElementType<S, P> => $ElementType<S, P>) => S => S
type SetPath2Type = <S: {}, P1: $Keys<S>, P2: $Keys<$ElementType<S, P1>>>(p1: P1, p2: P2) => (value: $ElementType<$ElementType<S, P1>, P2> | $ElementType<$ElementType<S, P1>, P2> => $ElementType<$ElementType<S, P1>, P2>) => S => S
type SetPath3Type = <S: {}, P1: $Keys<S>, P2: $Keys<$ElementType<S, P1>>, P3: $Keys<$ElementType<$ElementType<S, P1>, P2>>>(p1: P1, p2: P2, p3: P3) => (value: $ElementType<$ElementType<$ElementType<S, P1>, P2>, P3> | $ElementType<$ElementType<$ElementType<S, P1>, P2>, P3> => $ElementType<$ElementType<$ElementType<S, P1>, P2>, P3>) => S => S
type SetPath4Type = <S: {}, P1: $Keys<S>, P2: $Keys<$ElementType<S, P1>>, P3: $Keys<$ElementType<$ElementType<S, P1>, P2>>, P4: $Keys<$ElementType<$ElementType<$ElementType<S, P1>, P2>, P3>>>(p1: P1, p2: P2, p3: P3, p4: P4) => (value: $ElementType<$ElementType<$ElementType<$ElementType<S, P1>, P2>, P3>, P4> | $ElementType<$ElementType<$ElementType<$ElementType<S, P1>, P2>, P3>, P4> => $ElementType<$ElementType<$ElementType<$ElementType<S, P1>, P2>, P3>, P4>) => S => S

const
	_setPathF: any = <V, S>(valueComparator: (V, V) => bool) => (path: Array<string>) => (valueOrValueUpdater: V | V => V) => (state: S): S => {
		const
			prevValue: V = (path.reduce((v: any, k) => v[k], state): any)


		const nextValue: V = typeof valueOrValueUpdater === 'function' ? (valueOrValueUpdater: any)(prevValue) : valueOrValueUpdater

		if (valueComparator(prevValue, nextValue)) {
			return state
		}
		const
			newState = { ...state }


		const _path = path.slice()


		const lastKey = _path.pop()

		let currentPart = newState

		_path.forEach(key => {
			currentPart[key] = { ...currentPart[key] }
			currentPart = currentPart[key]
		})

		currentPart[lastKey] = nextValue
		return newState
	}
const _setPath = _setPathF((x, y) => x === y)
const _makeDeepCompareSetter = _setPathF(deepEqual)
const setProp: SetPropType = p => _setPath([p])
const setPropDeepCompare: SetPropType = p => _makeDeepCompareSetter([p])
const setPath2: SetPath2Type = (p1, p2) => _setPath([p1, p2])
const setPathDeepCompare2: SetPath2Type = (p1, p2) => _makeDeepCompareSetter([p1, p2])
const setPath3: SetPath3Type = (p1, p2, p3) => _setPath([p1, p2, p3])
const setPathDeepCompare3: SetPath3Type = (p1, p2, p3) => _makeDeepCompareSetter([p1, p2, p3])
const setPath4: SetPath4Type = (p1, p2, p3, p4) => _setPath([p1, p2, p3, p4])
const setPathDeepCompare4: SetPath4Type = (p1, p2, p3, p4) => _makeDeepCompareSetter([p1, p2, p3, p4])
// For value transformation

class $ValueContainer<V> {
#value: V
constructor(value: V) {
	this.#value = value
}
map<R>(mapper: V => R): $ValueContainer<R> { return new $ValueContainer<R>(mapper(this.#value)) }
value(): V { return this.#value }
}
// For state update
class $SingleTypeContainer<S> {
_state: S
constructor(state: S) {
	this._state = state
}
pipe(updater: S => S): $SingleTypeContainer<S> { return new $SingleTypeContainer<S>(updater(this._state)) }
value(): S { return this._state }
}
const ValueContainer = <V>(value: V): $ValueContainer<V> => new $ValueContainer(value)
const SingleTypeContainer = <S>(state: S): $SingleTypeContainer<S> => new $SingleTypeContainer(state)

export {
	T,
	F,
	ValueContainer,
	SingleTypeContainer,

	setProp,
	setPropDeepCompare,
	setPath2,
	setPathDeepCompare2,
	setPath3,
	setPathDeepCompare3,
	setPath4,
	setPathDeepCompare4,
}
