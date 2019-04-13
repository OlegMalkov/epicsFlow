// @flow

import React, { Component } from 'react'
import { type DispatchType } from '../../../src/epics'
import './app.css'
//import { store } from './store'
import { ColorPickerView } from './colorpicker/colorpickerView'
import { reduxStore } from './reduxStore'

//const _store = store
const _store = reduxStore
const initialState = _store.getState()

export class App extends Component<{}, typeof initialState> {
dispatch: DispatchType
constructor(props: {}) {
	super(props)
	this.state = initialState
	this.dispatch = _store.dispatch
}
componentDidMount() {
	_store.subscribe(appState => this.setState(appState))
}

render() {
	return (
		<div className="App">
			<ColorPickerView state={this.state.colorpicker} dispatch={this.dispatch} />
		</div>
	)
}
}
