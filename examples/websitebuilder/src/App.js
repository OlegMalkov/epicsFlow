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
// 9. Minimum component height is 5px
// 10. Selection should be removed on ESC down pressed, but only if workspace is current user focus (not preview, mve, dialog)
// *11. Shiftbar handles should apper on mouse enter and disapper on mouse out
// *12. Shiftbar handles should not appear during drag/resize/shitbar of component
// *13. Componen cursor should be 'move' when moving component, irrespectful of what is currently under mouse
// *14. Componen cursor should be 'resize' when resizing component, irrespectful of what is currently under mouse

import React, { Component } from 'react';
import './app.css';
import { wsbE } from './wsbE.js';
import { windowMouseMove, windowMouseUp, keyDown } from './globalACAC.js'
import { componentEpic } from './components/Component/componentEpic';
import { templateEpic } from './components/Template/templateEpic';
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown, templateAreaMouseDown } from './components/Template/templateACAC';
import { ComponentView } from './components/Component/componentView';
import { ResizeDecorationsView } from './components/ResizeDecorations/resizeDecorationsView';
import { resizeDecorationsEpic } from './components/ResizeDecorations/resizeDecorationsEpic';

declare var window: EventTarget;

const { createStore } = wsbE,
  store = createStore({
    epics: {
      component: componentEpic,
      resizeDecorations: resizeDecorationsEpic,
      template: templateEpic
    },
    debug: { trace: console.log,/*  devTools: { config: {} } */ }
  }),
  initialState = store.getState(),
  dispatch = store.dispatch

//$FlowFixMe
window.$R = {}
window.$R.store = store
      
export class App extends Component<{}, typeof initialState> {
  templateAreaRef: any
  constructor(props: {}) {
    super(props)
    this.state = initialState
    this.templateAreaRef = React.createRef();
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
    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        console.log('e.keyCode', e.keyCode)
         dispatch(keyDown.actionCreator({ keyCode: e.keyCode })) }
    )
  }
  render() {
    return (
      <div className="App">
        <div className="Header"/>
        <div className="Body">
            <div className="LeftPanel"/>
            <div className="Workspace">
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
                <div className="ComponentMainActions" />
              </div>
            </div>
            <div className="PropertiesPanel"/>
        </div>
      </div>
    );
  }
}