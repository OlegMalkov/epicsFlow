// @flow strict

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { App } from './app'
import './components/firebase/firebase'

const elem = document.getElementById('root')

if (elem) {
	ReactDOM.render(<App />, elem)
}
