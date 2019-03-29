// @flow

// Requirements
// 1. Moving components within template area
// 2. Changing template width with restriction to contain components
// 3. Components selection is happening on mouse up
// 4. Components movement starts only after mouse moved for more than one px (clumsy click protection)
// 5. Components should be selected if move completed on mouse up
// 6. Components should be deselected on mouse down on template area
// 7. Movement can be canceled by pressing ESC key
// 8. Components can be resized using top resizing handle. Top resize handle is 20px above components top if components height > 50px, otherwise 20 + (50 - componentsHeight) px.
// 9. Minimum components height is 1px
// 10. Selection should be removed on ESC down pressed, but only if workspace is current user focus (not preview, mve, dialog)
// *11. Shiftbar handles should apper on mouse enter and disapper on mouse out
// *12. Shiftbar handles should not appear during drag/resize/shitbar of components
// *13. Componen cursor should be 'move' when moving components, irrespectful of what is currently under mouse
// *14. Componen cursor should be 'resize' when resizing components, irrespectful of what is currently under mouse
// 15. Properties panel position should not overlap with components or mainActions when prop panel appears, it tries 4 positions in each corner with 20px padding, if all positions failed due to overlap with mainAction or components it should stay in left top corner
// 15a. If after properties panel appeard it still overlap mcta, mcta should search for position without overlaping properties panel
// 16. mainActions should not overlap with properties panel if prop panel increase it's height
// 17. Properties panel appears on components selection
// 18. Properties panel rendered in workspace viewport, but it is not following workspace scroll. It renders under topbar and left panel
// 19. Properties panel should never be outside of workspace viewport
// 20. Components main actions should never be outside of workspace
// 21. Properties panel should be dragable

import React, { Component } from 'react'
import { type DispatchType } from '../../../src/epics'
import './app.css'
import { ComponentsView } from './modules/components/componentsView'
import { PropertiesPanelView } from './modules/propertiesPanel/propertiesPanelView'
import { TopBarHeight } from './modules/topBar/topBarConstants'
import { addComponentPanelToggleExpansionButtonPressed } from './modules/addComponentPanel/addComponentPanelACnC'
import { workspaceScroll } from './modules/workspace/workspaceACnC'
import {
	templateWidthLeftResizeHandleMouseDown,
	templateWidthRightResizeHandleMouseDown,
} from './modules/template/templateACnC'
import { ResizeDecorationsView } from './modules/resizeDecorations/resizeDecorationsView'
import { MainActionsPanelView } from './modules/mainActionsPanel/mainActionsPanelView'
import { initSubscripitons } from './initSubscriptions'
import { propertiesPanelInitialState } from './modules/propertiesPanel/propertiesPanelState'
import { componentsInitialState } from './modules/components/componentsState'
import { mainActionsPanelInitialState } from './modules/mainActionsPanel/mainActionsPanelState'
import { resizeDecorationsInitialState } from './modules/resizeDecorations/resizeDecorationsState'
import { templateInitialState } from './modules/template/templateState'
import {
	addComponentPanelInitialState,
} from './modules/addComponentPanel/addComponentPanelState'

declare var window: EventTarget;

// eslint-disable-next-line flowtype/require-exact-type
type AppStateForRenderType = {
	addComponentPanel: typeof addComponentPanelInitialState,
	components: typeof componentsInitialState,
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
						<div className="AddComponentsPanel" style={{ width: this.state.addComponentPanel.width }} onClick={() => dispatch(addComponentPanelToggleExpansionButtonPressed.actionCreator())} />
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
									<ComponentsView state={this.state.components} dispatch={dispatch} />
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
