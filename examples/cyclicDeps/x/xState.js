// @flow
import { inc, dec } from '../utils'

type state = {| value: number, color: 'green' | 'red' |}
export opaque type xState: state = state

export const incX = (x: xState): xState => ({ ...x, value: inc(x.value)})
export const decX = (x: xState): xState => ({ ...x, value: dec(x.value)})
export const setXColor = (color: 'green' | 'red') => (x: xState): xState => ({ ...x, color })

export const initialXState: xState = { value: 4, color: 'green' }