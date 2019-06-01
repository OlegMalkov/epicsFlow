// @flow

import { evolve } from 'ramda'
import io from 'socket.io-client'
import React, { Component } from 'react'
import {
	type WorldType,
	worldInitialState,
	spawnWorm,
	generateFreeSpawnPosition_IMPURE,
	spawnApple,
	moveWorms,
	increaseAge,
	applyWormsSubconsciousInstructions,
	applyWormsConsciousInstructions,
	WorldDimensions,
	decreaseCollisionAnimationCounter,
	growApples,
	processWormsSubconscious,
} from './models/World'
import { createWorm } from './models/Worm'
import './app.css'
import { createRgbaColor } from './models/RgbaColor'

// $FlowFixMe
const isStop = (new URL(document.location)).searchParams.get('stop')

const socket = io('http://192.168.1.140:3005')

socket.on('connect', () => {
	socket.emit('identity', { type: 'world' })
})

export class App extends Component<{}, WorldType> {
	constructor(props: {}) {
		super(props)
		this.state = worldInitialState

		// $FlowFixMe
		this.gameLoop = this.gameLoop.bind(this)
		// $FlowFixMe
		this.spawnWorm = this.spawnWorm.bind(this)
		// $FlowFixMe
		this.restart = this.restart.bind(this)
	}

	spawnWorm(name: string, color: string) {
		const mayBeRgbaColor = createRgbaColor(color)

		if (mayBeRgbaColor) {
			const maybeWorm = createWorm({ name, color: mayBeRgbaColor })
			const maybeSpawnPosition = generateFreeSpawnPosition_IMPURE(this.state, 50)

			// $FlowFixMe
			maybeWorm.headingDegree = Math.random() * 360
			if (maybeWorm && maybeSpawnPosition) {
				const maybeState = spawnWorm(maybeWorm, maybeSpawnPosition)(this.state)

				if (maybeState) {
				// $FlowFixMe
					this.setState(maybeState)
				}
			}
		}
	}

	gameLoop() {
		if (isStop) return

		let nextState = this.state

		if (this.state.age > 300 && this.state.age % 60 === 0) {
			socket.emit('worldState', this.state)
		}

		if (this.state.age % 600 === 0 && this.state.apples.length < 30) {
			const maybeSpawnPosition = generateFreeSpawnPosition_IMPURE(this.state)

			if (maybeSpawnPosition) {
				nextState = spawnApple(maybeSpawnPosition)(nextState)
			}
		}

		// apply worms subconscious instructions
		nextState = applyWormsSubconsciousInstructions(nextState)

		// apply worms conscious instructions
		nextState = applyWormsConsciousInstructions(nextState)

		nextState = decreaseCollisionAnimationCounter(nextState)

		// grow apples
		if (this.state.age % 240 === 0) {
			nextState = growApples(nextState)
		}

		// process worms brains
		nextState = processWormsSubconscious(nextState)

		// move worms
		nextState = moveWorms(nextState)

		// increase age
		nextState = increaseAge(nextState)

		if (nextState !== this.state) {
			window.world = this.state
			this.setState((nextState: any))
		}

		window.requestAnimationFrame(this.gameLoop)
	}
	componentDidMount() {
		window.requestAnimationFrame(this.gameLoop)

		socket.on('worldState', (worldState) => {
			if (worldState !== null) {
				this.setState(worldState)
				window.world = this.state
			}
		})
		socket.on('createWorm', ({ name, color }) => {
			if (!name) return
			this.spawnWorm(name, color)
		})
		socket.on('burnSubcounscious', ({ name, script }) => {
			if (isStop) return
			if (!name) return
			this.setState(evolve({ worms: { [name]: { subconsciousScript: () => script}}}))
		})
	}

	renderWorms() {
		return <div>
			{
				Object.keys(this.state.worms).map(wormName => {
					const worm = this.state.worms[wormName]
					const wormHeight = worm.size / 8
					const wormEyeSize = worm.size / 15 * worm.vision / 100
					const halfWormEyeSize = wormEyeSize / 2

					return (
						<div
							key={wormName}
							onClick={() => this.setState({
								...this.state,
								worms: { ...this.state.worms, [wormName]: { ...this.state.worms[wormName], subconsciousScript: 'identity' } },
							})}
							onDoubleClick={() => {
								const yes = prompt('delete?')

								if (yes === 'yes') {
									const worms = { ...this.state.worms }

									delete worms[wormName]
									this.setState({	...this.state, worms })
								}
							}}
						>
							<div
								className="wormPosition"
								style={{
									left: worm.position.x,
									top: worm.position.y,
									transform: `rotate(${worm.headingDegree}deg)`,
								}}
							>
								<div
									className="wormName"
									style={{transform: `rotate(${-worm.headingDegree}deg)`}}
								>
									{wormName}
								</div>
								<div
									className="worm"
									style={{
										width: worm.size,
										height: wormHeight,
										backgroundColor: worm.color,
									}}
								>
									<span className="print" id={`print_${wormName}`}/>

									<div
										className="wormEye"
										style={{
											right: -halfWormEyeSize,
											top: -wormEyeSize + wormHeight / 2,
											width: wormEyeSize,
											height: wormEyeSize,
											backgroundColor: worm.color,
										}}
									/>
									<div
										className="wormEye"
										style={{
											right: -halfWormEyeSize,
											bottom: -wormEyeSize + wormHeight / 2,
											width: wormEyeSize,
											height: wormEyeSize,
											backgroundColor: worm.color,
										}}
									/>
									<div
										className="wormVision"
										style={{
											right: - worm.vision,
											top: -worm.vision + wormHeight / 2,
											width: worm.vision * 2,
											height: worm.vision * 2,
											backgroundColor: worm.color,
										}}
									/>
									<div
										className="wormCollisionAnimation"
										style={{
											transform: `rotate(${worm.headingDegree}deg)`,
											left: 0,
											top: -worm.size / 2,
											width: worm.size,
											height: worm.size,
											opacity: worm.collisionAnimationCounter / 200,
										}}
									/>
								</div>
							</div>
						</div>
					)
				})
			}
		</div>
	}

	renderApples() {
		return <div>
			{
				this.state.apples.map((apple, index) => {
					const halfAppleSize = apple.size / 2

					return (
						<div
							key={index}
							className="apple"
							style={{
								left: apple.position.x - halfAppleSize,
								top: apple.position.y - halfAppleSize,
								width: apple.size,
								height: apple.size,
							}}
						/>
					)
				})
			}
		</div>
	}

	restart() {
		// $FlowFixMe
		this.setState(worldInitialState)
	}

	render() {
		return (
			<div className="app">
				<button
					className="restart"
					onClick={this.restart}
				>
					Restart
				</button>
				<div className="world" style={{ ...WorldDimensions }}>
					{this.renderApples()}
					{this.renderWorms()}
				</div>

				<div className="playerStats">{Object.keys(this.state.worms).map(name => {
					const { attributesCapacity } = this.state.worms[name]
					const attrs = Math.round(attributesCapacity)
					/* const spd = Math.round(speed).toString().padStart(3, '0')
					const sz = Math.round(size).toString().padStart(3, '0')
					const vs = Math.round(vision).toString().padStart(3,'0') */

					return (
						<div key={name}>{name}: {attrs}</div>
					)
				})}</div>
			</div>
		)
	}
}

window.showCode = () => Object.keys(window.world.worms).map(name => [name, window.world.worms[name].subconsciousScript])
