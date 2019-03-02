// @flow strict
import { inc, dec } from '../utils'

type state = {| value: number, color: 'green' | 'red' |}
export opaque type yState: state = state

export const incY = (y: yState): yState => ({ ...y, value: inc(y.value)})
export const decY = (y: yState): yState => ({ ...y, value: dec(y.value)})
export const setYColor = (color: 'green' | 'red') => (y: yState): yState => ({ ...y, color })

export const initialYState: yState = { value: 2, color: 'red' }