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
// 20. Components main actions should never be outside of workspace
// 21. Properties panel should be dragable

import React, { Component } from 'react'
import { type DispatchType } from '../../../src/epics'
import './app.css'
import { ComponentView } from './components/component/componentView'
import { PropertiesPanelView } from './components/propertiesPanel/propertiesPanelView'
import { TopBarHeight } from './components/topBar/topBarConstants'
import { addComponentPanelToggleExpansionButtonPressed } from './components/addComponentPanel/addComponentPanelACnC'
import { workspaceScroll } from './components/workspace/workspaceACnC'
import {
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
} from './components/template/templateACnC'
import { ResizeDecorationsView } from './components/resizeDecorations/resizeDecorationsView'
import { MainActionsPanelView } from './components/mainActionsPanel/mainActionsPanelView'
import { initSubscripitons } from './initSubscriptions'
import { propertiesPanelInitialState } from './components/propertiesPanel/propertiesPanelState'
import { componentInitialState } from './components/component/componentState'
import { mainActionsPanelInitialState } from './components/mainActionsPanel/mainActionsPanelState'
import { resizeDecorationsInitialState } from './components/resizeDecorations/resizeDecorationsState'
import { templateInitialState } from './components/template/templateState'
import {
	addComponentPanelInitialState,
} from './components/addComponentPanel/addComponentPanelState'

declare var window: EventTarget;

// eslint-disable-next-line flowtype/require-exact-type
type AppStateForRenderType = {
	addComponentPanel: typeof addComponentPanelInitialState,
	component: typeof componentInitialState,
	mainActionsPanel: typeof mainActionsPanelInitialState,
	propertiesPanel: typeof propertiesPanelInitialState,
	resizeDecorations: typeof resizeDecorationsInitialState,
	template: typeof templateInitialState,
}

const createApp = ({ dispatch, subscribe, initialState }: {| dispatch: DispatchType, subscribe: (AppStateForRenderType => void) => void, initialState: AppStateForRenderType |}) => {
	class App extends Component<{}, AppStateForRenderType> {
		workspaceRef: { current: HTMLDivElement | null }
		dispatch: DispatchType
		constructor(props: {}) {
			super(props)
			this.state = initialState
			this.workspaceRef = React.createRef<HTMLDivElement>()
		}
		componentDidMount() {
			subscribe(appState => this.setState(appState))

			const { current } = this.workspaceRef

			if (current) {
				current.addEventListener('scroll', () => dispatch(workspaceScroll.actionCreator({ top: current.scrollTop })))
				dispatch(workspaceScroll.actionCreator({ top: current.scrollTop }))
			}
			initSubscripitons(dispatch)
		}

		render() {
			return (
				<div className="App">
					<div className="TopBar" style={{ height: TopBarHeight }} />
					<div className="Body">
						<div className="AddComponentPanel" style={{ width: this.state.addComponentPanel.width }} onClick={() => dispatch(addComponentPanelToggleExpansionButtonPressed.actionCreator())} />
						<div className="Workspace" >
							<div className="WorkspaceScrollableArea" ref={this.workspaceRef}>
								<div
									className="TemplateArea"
									style={{ width: this.state.template.width }}
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
									<MainActionsPanelView state={this.state.mainActionsPanel} dispatch={dispatch} />
								</div>
							</div>
							<PropertiesPanelView state={this.state.propertiesPanel} dispatch={dispatch} />
						</div>
					</div>
				</div>
			)
		}
	}

	return App
}


// eslint-disable-next-line import/group-exports
export type {
	AppStateForRenderType,
}

// eslint-disable-next-line import/group-exports
export {
	createApp,
}
