// @flow strict
import { deepEqual } from './epics';

type MakeSetter = <S: {}, P: $Keys<S>>(propName: P) => (value: $ElementType<S, P>) => S => S
export const makeSetter: MakeSetter = propName => value => state => ({ ...state, [propName]: value })
export const makeSetterOnAnyChangeDeepCompare: MakeSetter = propName => value => state => {
    if (deepEqual(state[propName], value)) {
        // $FlowFixMe 
        return state
    }
    return ({ ...state, [propName]: value })
}


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

const 
    ValueContainer = <V>(value: V): $ValueContainer<V> => new $ValueContainer(value),
    SingleTypeContainer = <S>(state: S): $SingleTypeContainer<S> => new $SingleTypeContainer(state)

export {
    ValueContainer,
    SingleTypeContainer
}