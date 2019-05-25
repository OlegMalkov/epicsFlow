// @flow

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

export class App extends Component<{}, WorldType> {
	constructor(props: {}) {
		super(props)
		this.state = worldInitialState

		// $FlowFixMe
		this.gameLoop = this.gameLoop.bind(this)
		// $FlowFixMe
		this.spawnWorm = this.spawnWorm.bind(this)
	}

	spawnWorm(i: number) {
		if (Object.keys(this.state.worms).length > 3) return
		const maybeWorm = createWorm({ name: `Roman${10 + i}` })
		const maybeSpawnPosition = generateFreeSpawnPosition_IMPURE(this.state)

		// $FlowFixMe
		maybeWorm.headingDegree = Math.random() * 360
		if (maybeWorm && maybeSpawnPosition) {
			const maybeState = spawnWorm(maybeWorm, maybeSpawnPosition)(this.state)

			if (maybeState) {
				// $FlowFixMe
				this.setState(maybeState)
			}
		}
		setTimeout(() => this.spawnWorm(i+1), 1000)
	}

	gameLoop() {
		let nextState = this.state

		if (this.state.age % 180 === 0) {
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
		if (this.state.age % 120 === 0) {
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
		this.spawnWorm(0)
	}

	renderWorms() {
		return <div>
			{
				Object.keys(this.state.worms).map(wormName => {
					const worm = this.state.worms[wormName]
					const wormHeight = worm.size / 10
					const wormEyeSize = worm.size / 15 * worm.vision / 100
					const halfWormEyeSize = wormEyeSize / 2

					return (
						<div key={wormName}>
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

	render() {
		return (
			<div className="app">
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
