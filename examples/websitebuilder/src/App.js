// @flow

// Requirements
// 1. Moving component within template area
// 2. Changing template width with restriction to contain component

import React, { Component } from 'react';
import './App.css';
import { wsbE } from './E';
import { type LTPosition, type Dimensions } from './types'
import { makeDndByMouseUpdaters, dndByMouseInitialScope, type DndByMouseScope } from './dndByMouse';
import { windowMouseMove, windowMouseUp } from './acac'

declare var window: EventTarget;

const { makeEpicWithScope, createStore, SACAC, RT } = wsbE

const
  componentMouseDown = new SACAC('COMPONENT_MOUSE_DOWN'),
  templateWidthLeftResizeHandleMouseDown = new SACAC('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN'),
  templateWidthRightResizeHandleMouseDown = new SACAC('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')


type TemplateState = {| width: number |}
type TemplateScope = {| dndChangeWidthByMouseUsingLeftHandle: DndByMouseScope, dndChangeWidthByMouseUsingRightHandle: DndByMouseScope |}
const
  makeUpdateWidthByDndUpdaters = ({ key, mouseDownCondition, reverse }) => makeDndByMouseUpdaters<TemplateState>({ 
        key,
        mouseDownCondition,
        getEntityPositionOnStart: ({ width }) => ({ left: width, top: 0 }),
        computeResult: ({ state, startPosition, positionDiff }) => 
          RT.updateState(({ ...state, width: Math.max(reverse ? startPosition.left + positionDiff.left : startPosition.left - positionDiff.left, 300) }))
      }),
  template = makeEpicWithScope<TemplateState, TemplateScope, empty>({
    vat: 'TEMPLATE',
    initialState: { width: 940 },
    initialScope: { 
      dndChangeWidthByMouseUsingLeftHandle: dndByMouseInitialScope,
      dndChangeWidthByMouseUsingRightHandle: dndByMouseInitialScope 
    },
    updaters: {
      ...makeUpdateWidthByDndUpdaters({ key: 'dndChangeWidthByMouseUsingLeftHandle', mouseDownCondition: templateWidthLeftResizeHandleMouseDown.c, reverse: true }),
      ...makeUpdateWidthByDndUpdaters({ key: 'dndChangeWidthByMouseUsingRightHandle', mouseDownCondition: templateWidthRightResizeHandleMouseDown.c, reverse: false })
    }
  })


type ComponentState =  {| ...LTPosition, ...Dimensions |}
type ComponentScope = {| dndMoveByMouse: DndByMouseScope |}
const
  component = makeEpicWithScope<ComponentState, ComponentScope, empty>({
    vat: 'COMPONENT',
    initialState: { left: 100, top: 100, width: 300, height: 200 },
    initialScope: { dndMoveByMouse: dndByMouseInitialScope },
    updaters: {
      ...makeDndByMouseUpdaters<ComponentState, 'dndMoveByMouse', ComponentScope>({ 
        key: 'dndMoveByMouse',
        mouseDownCondition: componentMouseDown.c,
        getEntityPositionOnStart: ({ left, top }) => ({ left, top }),
        computeResult: ({ state, startPosition, positionDiff }) => 
          RT.updateState(({ ...state, left: startPosition.left - positionDiff.left, top: startPosition.top - positionDiff.top }))
      })
    }
  })

const
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
                <div className="TemplateWidthResizeHandle" onMouseDown={() => dispatch(templateWidthLeftResizeHandleMouseDown.ac())}/>
                <div className="TemplateWidthResizeHandle TemplateWidthResizeHandleRight" onMouseDown={() => dispatch(templateWidthRightResizeHandleMouseDown.ac())}/>
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
