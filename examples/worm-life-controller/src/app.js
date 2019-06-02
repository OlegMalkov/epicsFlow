// @flow

import io from 'socket.io-client'
import React, { Component } from 'react'
/* import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-markup' */
import { type RgbaColorType, createRgbaColor } from '../../worm-life/src/models/RgbaColor'
import { type WormType } from '../../worm-life/src/models/Worm'
import './app.css'

type StateType = {|
	connected: false,
	name: string,
	color: RgbaColorType,
	worm?: WormType,
	subconsciousScript: string,
|}

function getRandomColor() {
	const letters = '0123456789ABCDEF'

	let color = '#'

	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
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

const Snippets = {
	identity: {
		key: 'identity',
		code: 'identity',
	},
	setAttributes: {
		key: 'setAttributes',
		code: `pipe(
 setSpeed(100),
 setSize(100),
 setVision(100),
 setHeading(90),
 startMove,
 setColor('rgba(46, 204, 113, 1)')
)`,
	},
	patrolX : {
		key: 'patrolX',
		code: `const x = prop('x')
const myPositionX = pipe(
 myPosition,
 x
)
const myXGt800 = converge(
 gt(__, 800),
 [myPositionX]
)
const myXLt400 = converge(
 lt(__, 400),
 [myPositionX]
)
const headingIs = degree => pipe(
 heading,
 equals(degree)
)
const myHeadingIs180or0 = either(
 headingIs(180),
 headingIs(0)
)

pipe(
 ifElse(
  myXGt800,
  pipe(
   stopMove,
   setHeading(180),
  ),
  when(
   myXLt400,
   pipe(
    stopMove,
    setHeading(0)
   )
  )
 ),
 ifElse(
  myHeadingIs180or0,
  startMove,
  setHeading(180)
 ),
 megaEater
)`,
	},
	patrolXY : {
		key: 'patrolXY',
		code: `const axisLogic = (
 getter,
 minHeading,
 maxHeading,
) => (
 minX, 
 maxX
) => 
ifElse(
 converge(
  gt(__, maxX),
  [getter]
 ),
 setHeading(maxHeading),
 when(
  converge(
   lt(__, minX),
   [getter]
  ),
  setHeading(minHeading)
 )
)

const xAxisLogic = axisLogic(
 myPositionX,
 0,
 180
)

const yAxisLogic = axisLogic(
 myPositionY,
 90,
 270
)

const boundTo = (
 minX,
 minY,
 maxX,
 maxY
) => pipe(
 xAxisLogic(minX, maxX),
 yAxisLogic(minY, maxY),
)

pipe(
 startMove,
 boundTo(100, 100, 500, 300),
 megaSpeed
)`,
	},
	shuriken_evolve : {
		key: 'shuriken_evolve',
		code: `pipe(
 evolve({
  me: {
   headingDegree: add(20)
  }
 }),
 megaSize
)`,
	},
	shuriken_converge : {
		key: 'shuriken_converge',
		code: `pipe(
 converge(
  setHeading,
  [pipe(heading, add(20)), identity]
 ),
 megaEater
)`,
	},
	headTowardsFirstApple: {
		key: 'headTowardsFirstApple',
		code: `const grabApple = pipe(
 turnToFirstApple,
 megaEater,
 startMove,
)
const stopAndLookAround = pipe(
 megaVision,
 stopMove
)

ifElse(
 firstApple,
 grabApple,
 stopAndLookAround
)		
`,
		eatingWithMemo:{
			key: 'eatingWithMemo',
			code: `const grabApple = pipe(
 turnToAppleInMemo,
 megaEater,
 startMove,
)
const stopAndLookAround = pipe(
 megaVision,
 stopMove
)
const rememberFirstApple = converge(
 remember('apple'),
 [firstApple, identity]
)

ifElse(
 recallApple,
 ifElse(
  iamNearTheAppleButItsGone,
  forgetApple,
  grabApple
 ),
 pipe(
  stopAndLookAround,
  when(
   firstApple,
   rememberFirstApple
  )
 )
)		
`,
		},
	},
}

const controllerIntialState: StateType = {
	connected: false,
	name: '',
	color: hexToRgbA(getRandomColor()),
	subconsciousScript: Snippets.identity.code,
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
			if (!worm) return
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
					<button onClick={this.connect} style={{ cursor: 'pointer' }}>Connect</button>
				</div>
			)} else {
			const { worm, subconsciousScript } = this.state

			if (!worm) {
				window.location.reload()
				return <div />
			}
			return (
				<div className="app">
					<select onChange={e => { this.setState({ subconsciousScript: Snippets[e.target.value].code }) }}>
						<option value={Snippets.identity.key}>identity</option>
						<option value={Snippets.setAttributes.key}>set attributes</option>
						<option value={Snippets.patrolX.key}>patrol X</option>
						<option value={Snippets.patrolXY.key}>patrol XY</option>
						<option value={Snippets.shuriken_evolve.key}>shuriken evolve</option>
						<option value={Snippets.shuriken_converge.key}>shuriken converge</option>
						<option value={Snippets.headTowardsFirstApple.key}>head towards first apple</option>
					</select>
					<label>{worm.name}</label>
					<label> speed: {Math.round(worm.speed)} | vision: {Math.round(worm.vision)} | size: {Math.round(worm.size)}</label>
					<label> heading: {Math.round(worm.headingDegree)} | moving: {worm.move ? 'yes' : 'no'}</label>
					{worm.subconsciousError && <label>error: {worm.subconsciousError}</label>}
					{/* <Editor
						placeholder="Type some code…"
						value={subconsciousScript}
						onValueChange={subconsciousScript => this.setState({ subconsciousScript })}
						highlight={code => highlight(code, languages.js)}
						padding={10}
						style={{
							border: '2px solid gray',
							height: 250,
							width: '100%',
							fontFamily: '"Fira code", "Fira Mono", monospace',
							fontSize: 12,
						}}
					/> */}
					<textarea
						style={{ height: 350, width: '100%', border: '2px solid gray', fontFamily: '"Fira code", "Fira Mono", monospace' }}
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
