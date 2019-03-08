// @flow strict

export function makeSetter<S: {}, P: $Keys<S>>(propName: P): ($ElementType<S, P>) => S => S { return  (value) => (state: S) => ({ ...state, [propName]: value }) } // eslint-disable-line