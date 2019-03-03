// @flow strict
import React, { Component } from 'react';
import './App.css';
import { initEpics } from './epics';

const
      E = initEpics(),
      store = E.createStore({
        epics: {}
      }),
      initialState = store.getState(),
      dispatch = store.dispatch
      
class App extends Component<{}, typeof initialState> {
  constructor(props: {}) {
    super(props)
    this.state = initialState
  }
  componentDidMount() {
    store.subscribeOnStateChange(appState => this.setState(appState))
  }
  render() {
    return (
      <div className="App">
        <div className="Header"/>
        <div className="Body">
            <div className="LeftPanel"/>
            <div className="Workspace">
              <div className="TemplateArea">
                <div className="Component"/>
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
