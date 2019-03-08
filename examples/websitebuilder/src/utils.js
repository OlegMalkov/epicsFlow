// @flow strict

type MakeSetter = <S: {}, P: $Keys<S>>(propName: P) => (value: $ElementType<S, P>) => S => S
export const makeSetter: MakeSetter = propName => value => state => ({ ...state, [propName]: value })