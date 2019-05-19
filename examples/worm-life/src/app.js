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
} from './models/World'
import { createWorm } from './models/Worm'
import './app.css'

export class App extends Component<{}, WorldType> {
	constructor(props: {}) {
		super(props)
		this.state = worldInitialState
		for (let i = 0; i < 5; i++) {
			const maybeWorm = createWorm({ name: `Oleg${i}` })
			const maybeSpawnPosition = generateFreeSpawnPosition_IMPURE(this.state)

			if (maybeWorm && maybeSpawnPosition) {
				const maybeState = spawnWorm(maybeWorm, maybeSpawnPosition)(this.state)

				if (maybeState) {
					this.state = maybeState
				}
			}
		}

		(this: any).gameLoop = this.gameLoop.bind(this)
	}

	gameLoop() {
		let nextState = this.state

		if (this.state.age % 300 === 0) { // spawn apple every 300 frames (5 sec)
			const maybeSpawnPosition = generateFreeSpawnPosition_IMPURE(this.state)

			if (maybeSpawnPosition) {
				nextState = spawnApple(maybeSpawnPosition)(nextState)
			}
		}

		// apply worms subconscious instructions
		nextState = applyWormsSubconsciousInstructions(nextState)

		// apply worms conscious instructions
		nextState = applyWormsConsciousInstructions(nextState)

		// move worms
		nextState = moveWorms(nextState)

		// increase age
		nextState = increaseAge(nextState)

		if (nextState !== this.state) {
			this.setState((nextState: any))
		}

		window.requestAnimationFrame(this.gameLoop)
	}
	componentDidMount() {
		window.requestAnimationFrame(this.gameLoop)
	}

	render() {
		return (
			<div className="app">
				<div className="world" style={{ ...WorldDimensions }}>
					{
						Object.keys(this.state.worms).map(wormName => {
							const worm = this.state.worms[wormName]
							const wormHeight = worm.size / 10
							const wormEyeSize = worm.size / 10 * worm.vision / 100
							const halfWormEyeSize = wormEyeSize / 2

							return (
								<div
									key={wormName}
									className="wormPosition"
									style={{
										left: worm.position.x,
										top: worm.position.y,
										transform: `rotate(${worm.headingDegree}deg)`,
									}}
								>
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
												right: - worm.vision / 2,
												top: -(worm.vision / 2) + wormHeight / 2,
												width: worm.vision,
												height: worm.vision,
												backgroundColor: worm.color,
											}}
										/>
									</div>
								</div>
							)
						})
					}
				</div>
			</div>
		)
	}
}
