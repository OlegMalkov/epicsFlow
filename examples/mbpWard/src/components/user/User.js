// @flow

import React from 'react'
import { type UserStateType } from './userEpic'
import './User.css'

type PropsType = {|
    state: UserStateType,
|}

export const User = ({ state }: PropsType) => {
	return (
		<div className="User">
			{ state.userName ? <div>Signed in as: {state.userName}</div> : <div/> }
		</div>
	)
}
