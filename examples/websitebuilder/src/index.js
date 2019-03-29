// @flow strict
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { wsbStore } from './wsbStore'
import { createApp } from './app'

const elem = document.getElementById('root')

const initialState = wsbStore.getState()

const App = createApp({ dispatch: wsbStore.dispatch, subscribe: wsbStore.subscribe, initialState })

if (elem) {
	ReactDOM.render(<App />, elem)
}
