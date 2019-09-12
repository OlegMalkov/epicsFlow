// @flow

import { EventKind } from './constants'

type PositionType = {| left: number, top: number |}
type DimensionsType = {| width: number, height: number |}

type BoxType = {|
    ...PositionType,
    ...DimensionsType,
|}

type TextInBoxType = {|
    box: BoxType,
    text: string,
|}

type EventKindType = $Keys<typeof EventKind>

export type {
	PositionType,
	BoxType,
	TextInBoxType,
	EventKindType,
}
