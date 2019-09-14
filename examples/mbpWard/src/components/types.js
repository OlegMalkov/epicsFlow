// @flow

import { EventKind } from './constants'

type PositionType = {| left: number, top: number |}
type DimensionsType = {| width: number, height: number |}

type BoxType = {|
    ...PositionType,
    ...DimensionsType,
|}

type BBoxType = {|
    ...PositionType,
    right: number,
    bottom: number,
|}

type TextInBoxType = {|
    box: BoxType,
    text: string,
|}

type EventKindType = $Values<typeof EventKind>

type EventType = {|
    fileName: string,
    nameBox: BoxType,
    phoneBox: BoxType,
    emailBox: BoxType,
    nationalityBox: BoxType,
|}

type ParticipantType = {|
    id: string,
    name: string,
    phone: string,
    email: string,
    nationality: string,
    events: Array<EventType>,
|}

export type {
	PositionType,
	DimensionsType,
	BoxType,
	BBoxType,
	TextInBoxType,
	EventKindType,
	ParticipantType,
}
