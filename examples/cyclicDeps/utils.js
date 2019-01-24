// @flow
export const isEven = (n: number) => n % 2 == 0
export const isOdd = (n: number) => !isEven(n)
export const inc = (n: number) => n + 1
export const dec = (n: number) => n - 1
export const compose2 = <S, S1, S2>(f2: S1 => S2, f1: S => S1, s: S): S2 => f2(f1(s))