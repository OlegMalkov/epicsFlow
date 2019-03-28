// @flow

// Requirements

import React, { Component } from 'react'
import './app.css'
import { windowMouseMove, windowMouseUp, keyDown } from './globalACAC'
import { reduxStore } from './reduxStore'
import { type DispatchType } from '../../../src/epics'
import { browserDimensions } from '../../websitebuilder/src/components/env/envACAC'
import { workspaceScroll } from '../../websitebuilder/src/components/workspace/workspaceACAC'
import { TopBarHeight } from '../../websitebuilder/src/components/topBar/topBarConstants'
import {
	addComponentPanelToggleExpansionButtonPressed,
} from '../../websitebuilder/src/components/addComponentPanel/addComponentPanelACAC'
import {
	templateAreaMouseDown,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
} from '../../websitebuilder/src/components/template/templateACAC'
import { ComponentView } from '../../websitebuilder/src/components/component/componentView'
import {
	ResizeDecorationsView,
} from '../../websitebuilder/src/components/resizeDecorations/resizeDecorationsView'
import {
	MainActionsPanelView,
} from '../../websitebuilder/src/components/mainActionsPanel/mainActionsPanelView'
import {
	PropertiesPanelView,
} from '../../websitebuilder/src/components/propertiesPanel/propertiesPanelView'

declare var window: EventTarget;
const initialState = reduxStore.getState()

function getBrowserDimensions() {
	// $FlowFixMe
	const	{ clientWidth, clientHeight } = document.documentElement
	const { innerWidth, innerHeight } = (window: any)

	return {
		width: Math.max(clientWidth, innerWidth || 0),
		height:  Math.max(clientHeight, innerHeight || 0),
	}
}
export class App extends Component<{}, typeof initialState> {
templateAreaRef: { current: HTMLDivElement | null }
workspaceRef: { current: HTMLDivElement | null }
dispatch: DispatchType
constructor(props: {}) {
	super(props)
	this.state = initialState
	this.templateAreaRef = React.createRef<HTMLDivElement>()
	this.workspaceRef = React.createRef<HTMLDivElement>()
}
componentDidMount() {
	this.dispatch = reduxStore.dispatch
	reduxStore.subscribe(appState => this.setState(appState))

	window.addEventListener(
		'mousemove',
		(e: MouseEvent) => this.dispatch(
			windowMouseMove.actionCreator({ position: { left: e.clientX, top: e.clientY } })
		)
	)
	window.addEventListener('mouseup', () => this.dispatch(windowMouseUp.actionCreator()))
	window.addEventListener('keydown', (e: KeyboardEvent) => this.dispatch(keyDown.actionCreator({ keyCode: e.keyCode })))

	this.dispatch(browserDimensions.actionCreator(getBrowserDimensions()))
	window.addEventListener('resize', () => this.dispatch(browserDimensions.actionCreator(getBrowserDimensions())))

	const { current } = this.workspaceRef

	if (current) {
		current.addEventListener('scroll', () => this.dispatch(workspaceScroll.actionCreator({ top: current.scrollTop })))
		this.dispatch(workspaceScroll.actionCreator({ top: current.scrollTop }))
	}
}

render() {
	return (
		<div className="App">
			<div className="TopBar" style={{ height: TopBarHeight }} />
			<div className="Body">
				<div className="AddComponentPanel" style={{ width: 50 }} onClick={() => this.dispatch(addComponentPanelToggleExpansionButtonPressed.ac())} />
				<div className="Workspace" >
					<div className="WorkspaceScrollableArea" ref={this.workspaceRef}>
						<div
							ref={this.templateAreaRef}
							className="TemplateArea"
							style={{ width: 700 }}
							onMouseDown={(e) => e.target === this.templateAreaRef.current && this.dispatch(templateAreaMouseDown.actionCreator())}
						>
							<div
								className="TemplateWidthResizeHandle"
								onMouseDown={() => this.dispatch(templateWidthLeftResizeHandleMouseDown.actionCreator())}
							/>
							<div
								className="TemplateWidthResizeHandle TemplateWidthResizeHandleRight"
								onMouseDown={() => this.dispatch(templateWidthRightResizeHandleMouseDown.actionCreator())}
							/>
							<ComponentView state={this.state.component.state} dispatch={this.dispatch} />
							<ResizeDecorationsView state={this.state.resizeDecorations} dispatch={this.dispatch} />
							<MainActionsPanelView state={this.state.mainActionsPanel} dispatch={this.dispatch} />
						</div>
					</div>
					<PropertiesPanelView state={this.state.propertiesPanel} dispatch={this.dispatch} />
				</div>
			</div>
		</div>
	)
}
}
