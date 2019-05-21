// @flow strict

const isEven = (n: number) => n % 2 == 0
const isOdd = (n: number) => !isEven(n)
const inc = (n: number) => n + 1
const dec = (n: number) => n - 1
const compose2 = <S, S1, S2>(f2: S1 => S2, f1: S => S1, s: S): S2 => f2(f1(s))

export {
	isEven,
	isOdd,
	inc,
	dec,
	compose2,
}
