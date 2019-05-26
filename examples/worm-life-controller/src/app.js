// @flow

import React, { Component } from 'react'
import { rgbaColorBlue, type RgbaColorType, createRgbaColor } from '../../worm-life/src/models/RgbaColor'
import { type WormType } from '../../worm-life/src/models/Worm'
import './app.css'

type StateType = {| type: 'notloaded', name: string, color: RgbaColorType |}
| {|
	type: 'loaded',
	worm: WormType,
	subconsciousScript: string,
|}

const controllerIntialState: StateType = {
	type: 'notloaded',
	name: '',
	color: rgbaColorBlue,
}

function hexToRgbA(hex) {
	let c

	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c= hex.substring(1).split('')
		if (c.length== 3) {
			c= [c[0], c[0], c[1], c[1], c[2], c[2]]
		}
		c= `0x${c.join('')}`
		return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},1)`
	}
	throw new Error('Bad Hex')
}

export class App extends Component<{}, StateType> {
	constructor(props: {}) {
		super(props)
		this.state = controllerIntialState

		//$FlowFixMe
		this.connect = this.connect.bind(this)
	}

	componentDidMount() {
		// connect to websocket server
	}

	connect() {
		// send msg to connect to worm
	}

	render() {
		if (this.state.type === 'notloaded') {
			const { name, color } = this.state

			const hexColor = `#${ color
				// $FlowFixMe
				.replace('rgba(', '')
				.replace(')', '')
				.split(',')
				.slice(0, 3)
				.map(s => parseInt(s, 10).toString(16).padStart(2, '0'))
				.join('')}`

			return (
				<div className="app">
					<label>Name</label>
					<input
						value={name}
						onChange={e => this.setState(({ name: e.target.value }: any))}
					/>
					<label>Color</label>
					<input
						style={{ height: 100 }}
						type="color"
						value={hexColor}
						onChange={e => {
							const value = e.target.value

							setTimeout(() => {
								const color = createRgbaColor(hexToRgbA(value))

								if (color) {
									this.setState(({ color }: any))
								}
							})
						}}
					/>
					<div style={{ flex: 1 }}/>
					<button onClick={this.connect}>Connect</button>
				</div>
			)
		}

		if (this.state.type === 'loaded') {
			const { worm, subconsciousScript } = this.state

			return (
				<div className="app">
					<label>Name: {worm.name}</label>
					<label>Script</label>
					<textarea
						style={{ flex: 1}}
						value={subconsciousScript}
					/>
					<button>Burn subcoscious</button>
				</div>
			)
		}
		return <div/>
	}
}
