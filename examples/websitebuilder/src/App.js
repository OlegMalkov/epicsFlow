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
      </div>
    );
  }
}

export default App;
