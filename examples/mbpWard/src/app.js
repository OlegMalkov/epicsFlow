// @flow

import React, { Component } from 'react'
import { type DispatchType } from '../../../src/epics'
import './app.css'
import { windowMouseMoveEvent, windowMouseUpEvent, keyDownEvent } from './globalEvents'
import { BrowserDimensionsEvent } from './components/env/envEvents'
import { mbpStore } from './mbpStore'
import { Workspace } from './components/workspace/Workspace'
import { User } from './components/user/User';

declare var window: EventTarget;
const initialState = mbpStore.getState()

function getBrowserDimensions() {
	// $FlowFixMe
	const	{ clientWidth, clientHeight } = document.documentElement
	const { innerWidth, innerHeight } = (window: any)

	return {
		width: Math.max(clientWidth, innerWidth || 0),
		height:  Math.max(clientHeight, innerHeight || 0),
	}
}

export class App extends Component<{}, typeof initialState> {
	dispatch: DispatchType
	constructor(props: {}) {
		super(props)
		this.state = initialState
	}
	componentDidMount() {
		this.dispatch = mbpStore.dispatch
		mbpStore.subscribe(appState => this.setState(appState))

		window.addEventListener(
			'mousemove',
			(e: MouseEvent) => this.dispatch(
				windowMouseMoveEvent.create({ position: { left: e.clientX, top: e.clientY } })
			)
		)
		window.addEventListener('mouseup', () => this.dispatch(windowMouseUpEvent.create()))
		window.addEventListener('keydown', (e: KeyboardEvent) => this.dispatch(keyDownEvent.create({ keyCode: e.keyCode })))

		this.dispatch(BrowserDimensionsEvent.create(getBrowserDimensions()))
		window.addEventListener('resize', () => this.dispatch(BrowserDimensionsEvent.create(getBrowserDimensions())))
	}

	render() {
		return (
			<div
				className="App"
			>
				<Workspace state={this.state.workspace} dispatch={mbpStore.dispatch}/>
				<User state={this.state.user} />
			</div>
		)
	}
}
