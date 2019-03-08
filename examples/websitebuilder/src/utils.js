// @flow strict

type MakeSetter = <S: {}, P: $Keys<S>>(propName: P) => (value: $ElementType<S, P>) => S => S
export const makeSetter: MakeSetter = propName => value => state => ({ ...state, [propName]: value })


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
class $StateContainer<S> {
    #state: S
    constructor(state: S) {
        this.#state = state
    }
    pipe(updater: S => S): $StateContainer<S> { return new $StateContainer<S>(updater(this.#state)) }
    value(): S { return this.#state }
} 

const 
    ValueContainer = <V>(value: V): $ValueContainer<V> => new $ValueContainer(value),
    StateContainer = <S>(state: S): $StateContainer<S> => new $StateContainer(state)

export {
    ValueContainer,
    StateContainer
}