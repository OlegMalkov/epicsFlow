// @flow

// Requirements
// 1. Moving component within template area
// 2. Changing template width with restriction to contain component

import React, { Component } from 'react';
import './App.css';
import { wsbE } from './E';
import { type LTPosition, type Dimensions } from './types'
import { windowMouseMove, windowMousePositionCondition, windowMouseUp } from './acac'

declare var window: EventTarget;

const { makeEpicWithScope, makeUpdater, createStore, makeSACAC, ResultType } = wsbE

const
  componentMouseDown = makeSACAC('COMPONENT_MOUSE_DOWN'),
  templateWidthLeftResizeHandleMouseDown = makeSACAC('TEMPLATE_WIDTH_LEFT_RESIZE_HANDLE_MOUSE_DOWN'),
  templateWidthRightResizeHandleMouseDown = makeSACAC('TEMPLATE_WIDTH_RIGHT_RESIZE_HANDLE_MOUSE_DOWN')

const dndInitialState = { type: 'idle' }

type TemplateState = {| width: number |}
type TemplateScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', startWidth: number, mouseStartLeft: number |} |}
const
  template = makeEpicWithScope<TemplateState, TemplateScope, empty>({
    vat: 'TEMPLATE',
    initialState: { width: 940 },
    initialScope: { dnd: dndInitialState },
    updaters: {
      dnd: makeUpdater({
        conditions: {
          mouseLeft: windowMousePositionCondition.withSelector(({ left }) => left),
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['leftDown', 'rightDown']),
          leftDown: templateWidthLeftResizeHandleMouseDown.condition.toOptional(),
          rightDown: templateWidthRightResizeHandleMouseDown.condition.toOptional()
        },
        reducer: ({ state, scope, values: { mouseLeft, leftDown, rightDown }, changedActiveConditionsKeys }) => { 
          if (!leftDown && !rightDown) return ResultType.doNothing
          
          if (changedActiveConditionsKeys[0] === 'mouseUp') {
            return ResultType.updateScope({ ...scope, dnd: dndInitialState })
          }

          const { dnd } = scope
          if (dnd.type === 'idle') {
            return ResultType.updateScope({ ...scope, dnd: { type: 'progress', startWidth: state.width, mouseStartLeft: mouseLeft } })
          }

          const 
            { startWidth, mouseStartLeft } = dnd,
            leftDiff = mouseStartLeft - mouseLeft

          return ResultType.updateState(({ ...state, width: leftDown ? startWidth + leftDiff : startWidth - leftDiff })) 
        }
      })
    }
  })

type ComponentState =  {| ...LTPosition, ...Dimensions |}
type ComponentScope = {| dnd: {| type: 'idle' |} | {| type: 'progress', componentStartPos: LTPosition, mouseStartPos: LTPosition |} |}
const
  component = makeEpicWithScope<ComponentState, ComponentScope, empty>({
    vat: 'COMPONENT',
    initialState: { left: 100, top: 100, width: 300, height: 200 },
    initialScope: { dnd: dndInitialState },
    updaters: {
      dnd: makeUpdater({
        conditions: {
          mousePosition: windowMousePositionCondition,
          mouseUp: windowMouseUp.condition.toOptional().resetConditionsByKeyAfterReducerCall(['mouseDown']),
          mouseDown: componentMouseDown.condition,
        },
        reducer: ({ state, state: { left, top }, scope, values: { mousePosition }, changedActiveConditionsKeys }) => { 
          if (changedActiveConditionsKeys[0] === 'mouseUp') {
            return ResultType.updateScope({ ...scope, dnd: dndInitialState })
          }
          const { dnd } = scope
          if (dnd.type === 'idle') {
            return ResultType.updateScope({ ...scope, dnd: { type: 'progress', componentStartPos: { left, top }, mouseStartPos: mousePosition } })
          }
          const 
            { componentStartPos, mouseStartPos } = dnd,
            diffLeft = mouseStartPos.left - mousePosition.left,
            diffTop = mouseStartPos.top - mousePosition.top

          return ResultType.updateState(({ ...state, left: componentStartPos.left - diffLeft, top: componentStartPos.top - diffTop })) 
        }
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

    window.addEventListener(
      'mousemove', 
      (e: MouseEvent) => dispatch(
        windowMouseMove.actionCreator({ position: { left: e.clientX, top: e.clientY } })
      )
    )
    window.addEventListener(
      'mouseup',
      (e: MouseEvent) => dispatch(windowMouseUp.actionCreator())
    )
  }
  render() {
    return (
      <div className="App">
        <div className="Header"/>
        <div className="Body">
            <div className="LeftPanel"/>
            <div className="Workspace">
              <div className="TemplateArea" style={{ width: this.state.template.width }}>
                <div 
                  className="TemplateWidthResizeHandle"
                  onMouseDown={() => dispatch(templateWidthLeftResizeHandleMouseDown.actionCreator())}
                />
                <div 
                  className="TemplateWidthResizeHandle TemplateWidthResizeHandleRight"
                  onMouseDown={() => dispatch(templateWidthRightResizeHandleMouseDown.actionCreator())}
                />
                <div 
                  className="Component"
                  style={this.state.component}
                  onMouseDown={() => dispatch(componentMouseDown.ac())}
                />
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export default App;
