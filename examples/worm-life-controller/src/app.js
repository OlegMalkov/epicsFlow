// @flow

import io from 'socket.io-client'
import React, { Component } from 'react'
import { rgbaColorBlue, type RgbaColorType, createRgbaColor } from '../../worm-life/src/models/RgbaColor'
import { type WormType } from '../../worm-life/src/models/Worm'
import './app.css'

type StateType = {|
	connected: false,
	name: string,
	color: RgbaColorType,
	worm?: WormType,
	subconsciousScript: string,
|}

const controllerIntialState: StateType = {
	connected: false,
	name: '',
	color: rgbaColorBlue,
	subconsciousScript: 'identity',
}

function hexToRgbA(hex) {
	let c

	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c= hex.substring(1).split('')
		if (c.length== 3) {
			c= [c[0], c[0], c[1], c[1], c[2], c[2]]
		}
		c= `0x${c.join('')}`
		// $FlowFixMe
		return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},1)`
	}
	throw new Error('Bad Hex')
}

export class App extends Component<{}, StateType> {
	initialized: bool = false
	socket: any
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
		if (this.initialized || !this.state.name) return

		this.initialized = true
		const socket = io('http://192.168.1.140:3005')

		this.socket = socket
		socket.on('connect', () => {
			socket.emit('identity', {
				type: 'controller',
				name: this.state.name,
				color: this.state.color,
			})
		})

		socket.on('wormState', (worm: WormType) => {
			if (!this.state.connected) {
				this.setState({ subconsciousScript: worm.subconsciousScript })
			}
			// $FlowFixMe
			this.setState({ worm, connected: true })
		})
	}

	render() {
		if (!this.state.connected) {
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
					<button onClick={this.connect} style={{ cursor: 'pointer' }}>Connect</button>
				</div>
			)} else {
			const { worm, subconsciousScript } = this.state

			return (
				<div className="app">
					<label>Name: {worm.name}</label>
					<label>spd: {Math.round(worm.speed)} | spd: {Math.round(worm.vision)} | spd: {Math.round(worm.size)} | move: {worm.move}</label>
					<label>error: {worm.subconsciousError}</label>
					<textarea
						style={{ flex: 1}}
						value={subconsciousScript}
						onChange={(e) => this.setState({ subconsciousScript: e.target.value })}
					/>
					<button
						onClick={() => this.socket.emit('burnSubcounscious', subconsciousScript)}
						style={{ cursor: 'pointer' }}
					>
						Burn subcoscious
					</button>
				</div>
			)
		}
	}
}
