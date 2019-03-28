// @flow

import React, { Component } from 'react'
import { type DispatchType } from '../../../src/epics'
import './app.css'
import { store } from './store'

declare var window: EventTarget;
const initialState = store.getState()

export class App extends Component<{}, typeof initialState> {
dispatch: DispatchType
constructor(props: {}) {
	super(props)
	this.state = initialState
}
componentDidMount() {
	this.dispatch = store.dispatch
	store.subscribeOnStateChange(appState => this.setState(appState))
}

render() {
	return (
		<div className="App">

		</div>
	)
}
}
