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
// 15. Properties panel position should not overlap with component or componentsMainActions when prop panel appears, it tries 4 positions in each corner with 20px padding, if all positions failed due to overlap with componentsMainAction or component it should stay in left top corner
// 15a. If after properties panel appeard it still overlap mcta, mcta should search for position without overlaping properties panel
// 16. componentsMainActions should not overlap with properties panel if prop panel increase it's height
// 17. Properties panel appears on component selection
// 18. Properties panel rendered in workspace viewport, but it is not following workspace scroll. It renders under topbar and left panel
// 19. Properties panel should never be outside of workspace viewport
// 20. Components main actions should never be outside of workspace
// 21. Properties panel should be dragable

import React, { Component } from 'react'
import './app.css'
import { windowMouseMove, windowMouseUp, keyDown } from './globalACAC'
import { componentEpic } from './components/component/componentEpic'
import { templateEpic } from './components/template/templateEpic'
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown, templateAreaMouseDown } from './components/template/templateACAC'
import { ComponentView } from './components/component/componentView'
import { ResizeDecorationsView } from './components/componentResizeDecorations/componentResizeDecorationsView'
import { componentResizeDecorationsEpic } from './components/componentResizeDecorations/componentResizeDecorationsEpic'
import { componentMainActionsEpic } from './components/componentMainActions/componentMainActionsEpic'
import { ComponentMainActionsView } from './components/componentMainActions/componentMainActionsView'
import { propertiesPanelEpic } from './components/propertiesPanel/propertiesPanelEpic'
import { PropertiesPanelView } from './components/propertiesPanel/propertiesPanelView'
import { TopBarHeight } from './components/topBar/topBarConstants'
import { browserDimensions } from './components/env/envACAC'
import { leftPanelEpic } from './components/leftPanel/leftPanelEpic'
import { leftPanelToggleExpansionButtonPressed } from './components/leftPanel/leftPanelACAC'
import { workspaceViewportEpic } from './components/workspace/workspaceViewportEpic'
import { workspaceScroll } from './components/workspace/workspaceACAC'
import { createStore, traceToString } from './epics'

declare var window: EventTarget;


const store = createStore({
	epics: {
		component: componentEpic,
		componentMainActions: componentMainActionsEpic,
		resizeDecorations: componentResizeDecorationsEpic,
		propertiesPanel: propertiesPanelEpic,
		template: templateEpic,
		leftPanel: leftPanelEpic,

		_workspaceViewport: workspaceViewportEpic,
	},
	debug: {
		// eslint-disable-next-line no-console
		warn: console.warn,
		// eslint-disable-next-line no-console
		trace: e => console.log(traceToString(e)),
		devTools: { config: {} },
	},
})

const initialState = store.getState()
const dispatch = store.dispatch

//$FlowFixMe
window.$R = {}
window.$R.store = store

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
templateAreaRef: any
workspaceRef: any
constructor(props: {}) {
	super(props)
	this.state = initialState
	this.templateAreaRef = React.createRef()
	this.workspaceRef = React.createRef()
}
componentDidMount() {
	store.subscribeOnStateChange(appState => this.setState(appState))

	window.addEventListener(
		'mousemove',
		(e: MouseEvent) => dispatch(
			windowMouseMove.actionCreator({ position: { left: e.clientX, top: e.clientY } })
		)
	)
	window.addEventListener('mouseup', () => dispatch(windowMouseUp.actionCreator()))
	window.addEventListener('keydown', (e: KeyboardEvent) => dispatch(keyDown.actionCreator({ keyCode: e.keyCode })))

	dispatch(browserDimensions.actionCreator(getBrowserDimensions()))
	window.addEventListener('resize', () => dispatch(browserDimensions.actionCreator(getBrowserDimensions())))

	this.workspaceRef.current.addEventListener('scroll', () => dispatch(workspaceScroll.actionCreator({ top: this.workspaceRef.current.scrollTop })))
	dispatch(workspaceScroll.actionCreator({ top: this.workspaceRef.current.scrollTop }))
}

render() {
	return (
		<div className="App">
			<div className="TopBar" style={{ height: TopBarHeight }} />
			<div className="Body">
				<div className="LeftPanel" style={{ width: this.state.leftPanel.width }} onClick={() => dispatch(leftPanelToggleExpansionButtonPressed.ac())} />
				<div className="Workspace" >
					<div className="WorkspaceScrollableArea" ref={this.workspaceRef}>
						<div
							ref={this.templateAreaRef}
							className="TemplateArea"
							style={{ width: this.state.template.width }}
							onMouseDown={(e) => e.target === this.templateAreaRef.current && dispatch(templateAreaMouseDown.actionCreator())}
						>
							<div
								className="TemplateWidthResizeHandle"
								onMouseDown={() => dispatch(templateWidthLeftResizeHandleMouseDown.actionCreator())}
							/>
							<div
								className="TemplateWidthResizeHandle TemplateWidthResizeHandleRight"
								onMouseDown={() => dispatch(templateWidthRightResizeHandleMouseDown.actionCreator())}
							/>
							<ComponentView state={this.state.component} dispatch={dispatch} />
							<ResizeDecorationsView state={this.state.resizeDecorations} dispatch={dispatch} />
							<ComponentMainActionsView state={this.state.componentMainActions} dispatch={dispatch} />
						</div>
					</div>
					<PropertiesPanelView state={this.state.propertiesPanel} dispatch={dispatch} />
				</div>
			</div>
		</div>
	)
}
}
