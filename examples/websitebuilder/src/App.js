// @flow strict

// Requirements
// 1. Moving component

import React, { Component } from 'react';
import './App.css';
import { initEpics } from './epics';

declare var window: EventTarget;

const { RT, makeUpdater, makeEpicWithScope, createStore, ACAC, SACAC } = initEpics()

type Position = {| left: number, top: number |}
type Dimensions = {| width: number, height: number |}

const
  windowMouseMove = new ACAC<{| position: Position |}>('WINDOW_MOUSE_MOVE'),
  windowMousePositionC = windowMouseMove.c.wsk('position'),
  windowMousePositionPC = windowMousePositionC.tp(),
  windowMouseUp = new SACAC('WINDOW_MOUSE_UP'),
  componentMouseDown = new SACAC('COMPONENT_MOUSE_DOWN'),
  templateWidthResizeHandleMouseDown = new SACAC('TEMPLATE_WIDTH_RESIZE_HANDLE_MOUSE_DOWN')

type LTWH = {| ...Position, ...Dimensions |}

type DndByMouseScope = {| type: 'idle' |} | {|
  type: 'in_progress',
  entityPositionOnStart: Position,
  windowMousePositionOnStart: Position
|}
const dndByMouseInitialScope = { type: 'idle' }

const
  component = makeEpicWithScope<LTWH, {| dndByMouse: DndByMouseScope |}, empty>({
    vat: 'COMPONENT',
    initialState: { left: 100, top: 100, width: 300, height: 200 },
    initialScope: { dndByMouse: dndByMouseInitialScope },
    updaters: {
      mouseDownOnComponent: makeUpdater({ 
        conditions: { _: componentMouseDown.c, mousePosition: windowMousePositionPC },
        reducer: ({ values: { mousePosition }, scope, state: { left, top } }) => RT.updateScope({ 
          ...scope, 
          dndByMouse: {
            type: 'in_progress',
            entityPositionOnStart: { left, top },
            windowMousePositionOnStart: mousePosition
          }
        })
      }),
      mouseMove: makeUpdater({ 
        conditions: { windowMousePosition: windowMousePositionC },
        reducer: ({ values: { windowMousePosition }, state, scope: { dndByMouse } }) => {
          if (dndByMouse.type === 'idle') return RT.doNothing

          const { windowMousePositionOnStart, entityPositionOnStart } = dndByMouse
          return RT.updateState({ 
            ...state,
            left: entityPositionOnStart.left - (windowMousePositionOnStart.left - windowMousePosition.left),
            top: entityPositionOnStart.top - (windowMousePositionOnStart.top - windowMousePosition.top),
          })
        }
      }),
      mouseUp: makeUpdater({ 
        conditions: { _: windowMouseUp.c },
        reducer: ({ scope }) => RT.updateScope({ ...scope, dndByMouse: dndByMouseInitialScope })
      })
    }
  }),
  template = makeEpicWithScope<{| width: number |}, DndByMouseScope, empty>({
    vat: 'TEMPLATE',
    initialState: { width: 940 },
    initialScope: dndByMouseInitialScope,
    updaters: {
      
    }
  }),
  store = createStore({
    epics: {
      component,
      template
    },
    debug: { trace: console.log }
  }),
  initialState = store.getState(),
  dispatch = store.dispatch

//$FlowFixMe
window.$R = {}
window.$R.store = store
      
class App extends Component<{}, typeof initialState> {
  constructor(props: {}) {
    super(props)
    this.state = initialState
  }
  componentDidMount() {
    store.subscribeOnStateChange(appState => this.setState(appState))

    window.addEventListener('mousemove', (e: MouseEvent) => dispatch(windowMouseMove.ac({ position: { left: e.clientX, top: e.clientY } })))
    window.addEventListener('mouseup', (e: MouseEvent) => dispatch(windowMouseUp.ac()))
  }
  render() {
    return (
      <div className="App">
        <div className="Header"/>
        <div className="Body">
            <div className="LeftPanel"/>
            <div className="Workspace">
              <div className="TemplateArea" style={{ width: this.state.template.width }}>
                <div className="TemplateWidthResizeHandle" onMouseDown={() => dispatch(templateWidthResizeHandleMouseDown.ac())}/>
                <div 
                  className="Component"
                  style={this.state.component}
                  onMouseDown={() => dispatch(componentMouseDown.ac())}
                />
                <div className="ComponentMainActions"/>
              </div>
            </div>
            <div className="PropertiesPanel"/>
        </div>
      </div>
    );
  }
}

export default App;
