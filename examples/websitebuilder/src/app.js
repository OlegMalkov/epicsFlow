// @flow

// Requirements
// 1. Moving component within template area
// 2. Changing template width with restriction to contain component
// 3. Component selection is happening on mouse up
// 4. Component movement starts only after mouse moved for more than one px (clumsy click protection)
// 5. Component should be selected if move completed on mouse up
// 6. Component should be deselected on mouse down on template area
// 7. Movement can be canceled by pressing ESC key
// 8. Component can be resized using top resizing handle. Top resize handle is 20px above component top if component height > 50px, otherwise 20 + (50 - componentHeight) px.
// 9. Minimum component height is 1px
// 10. Selection should be removed on ESC down pressed, but only if workspace is current user focus (not preview, mve, dialog)
// *11. Shiftbar handles should apper on mouse enter and disapper on mouse out
// *12. Shiftbar handles should not appear during drag/resize/shitbar of component
// *13. Componen cursor should be 'move' when moving component, irrespectful of what is currently under mouse
// *14. Componen cursor should be 'resize' when resizing component, irrespectful of what is currently under mouse
// 15. Properties panel position should not overlap with component or mainActions when prop panel appears, it tries 4 positions in each corner with 20px padding, if all positions failed due to overlap with mainAction or component it should stay in left top corner
// 15a. If after properties panel appeard it still overlap mcta, mcta should search for position without overlaping properties panel
// 16. mainActions should not overlap with properties panel if prop panel increase it's height
// 17. Properties panel appears on component selection
// 18. Properties panel rendered in workspace viewport, but it is not following workspace scroll. It renders under topbar and left panel
// 19. Properties panel should never be outside of workspace viewport
// 20. Components main msgs should never be outside of workspace
// 21. Properties panel should be dragable

import React, { Component } from 'react'
import { type DispatchType } from '../../../src/epics'
import './app.css'
import { windowMouseMoveEvent, windowMouseUpEvent, keyDownEvent } from './globalEvents'
import { ComponentView } from './components/component/componentView'
import { PropertiesPanelView } from './components/propertiesPanel/propertiesPanelView'
import { TopBarHeight } from './components/topBar/topBarConstants'
import { browserDimensions } from './components/env/envEvents'
import { addComponentPanelToggleExpansionButtonPressed } from './components/addComponentPanel/addComponentPanelEvents'
import { workspaceScroll } from './components/workspace/workspaceEvents'
import { wsbStore } from './wsbStore'
import {
	templateAreaMouseDownEvent,
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
} from './components/template/templateEvents'
import { ResizeDecorationsView } from './components/resizeDecorations/resizeDecorationsView'
import { MainActionsPanelView } from './components/mainActionsPanel/mainActionsPanelView'

declare var window: EventTarget;
const initialState = wsbStore.getState()

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
	this.dispatch = wsbStore.dispatch
	wsbStore.subscribe(appState => this.setState(appState))

	window.addEventListener(
		'mousemove',
		(e: MouseEvent) => this.dispatch(
			windowMouseMoveEvent.create({ position: { left: e.clientX, top: e.clientY } })
		)
	)
	window.addEventListener('mouseup', () => this.dispatch(windowMouseUpEvent.create()))
	window.addEventListener('keydown', (e: KeyboardEvent) => this.dispatch(keyDownEvent.create({ keyCode: e.keyCode })))

	this.dispatch(browserDimensions.create(getBrowserDimensions()))
	window.addEventListener('resize', () => this.dispatch(browserDimensions.create(getBrowserDimensions())))

	const { current } = this.workspaceRef

	if (current) {
		current.addEventListener('scroll', () => this.dispatch(workspaceScroll.create({ top: current.scrollTop })))
		this.dispatch(workspaceScroll.create({ top: current.scrollTop }))
	}
}

render() {
	return (
		<div className="App">
			<div className="TopBar" style={{ height: TopBarHeight }} />
			<div className="Body">
				<div className="AddComponentPanel" style={{ width: this.state.addComponentPanel.width }} onClick={() => this.dispatch(addComponentPanelToggleExpansionButtonPressed.create())} />
				<div className="Workspace" >
					<div className="WorkspaceScrollableArea" ref={this.workspaceRef}>
						<div
							ref={this.templateAreaRef}
							className="TemplateArea"
							style={{ width: this.state.template.width }}
							onMouseDown={(e) => e.target === this.templateAreaRef.current && this.dispatch(templateAreaMouseDownEvent.create())}
						>
							<div
								className="TemplateWidthResizeHandle"
								onMouseDown={() => this.dispatch(templateWidthLeftResizeHandleMouseDown.create())}
							/>
							<div
								className="TemplateWidthResizeHandle TemplateWidthResizeHandleRight"
								onMouseDown={() => this.dispatch(templateWidthRightResizeHandleMouseDown.create())}
							/>
							<ComponentView state={this.state.component} dispatch={this.dispatch} />
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
