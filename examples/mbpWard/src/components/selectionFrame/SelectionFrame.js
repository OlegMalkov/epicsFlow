// @flow

import React from 'react'
import { type SelectionFrameStateType } from './selectionFrameEpic'
import './SelectionFrame.css'

type PropsType = {|
    state: SelectionFrameStateType,
|}

export const SelectionFrame = ({ state }: PropsType) => {
	return (<div className="SelectionFrame" style={{ ...state.box, display: state.active ? 'block' : 'none' }} />)
}
