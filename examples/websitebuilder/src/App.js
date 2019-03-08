// @flow

// Requirements
// 1. Moving component within template area
// 2. Changing template width with restriction to contain component

import React, { Component } from 'react';
import './App.css';
import { wsbE } from './wsbE.js';
import { windowMouseMove, windowMouseUp } from './globalACAC.js'
import { componentEpic } from './components/Component/componentEpic';
import { templateEpic } from './components/Template/templateEpic';
import { templateWidthLeftResizeHandleMouseDown, templateWidthRightResizeHandleMouseDown } from './components/Template/templateACAC';
import { componentMouseDown } from './components/Component/componentACAC';

declare var window: EventTarget;

const { createStore } = wsbE,
  store = createStore({
    epics: {
      component: componentEpic,
      template: templateEpic
    },
    debug: { trace: console.log,/*  devTools: { config: {} } */ }
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
