// @flow strict
import React, { Component } from 'react';
import './App.css';
import { initEpics } from '../../../src/epics';

const
      E = initEpics(),
      store = E.createStore({
        epics: {},
        onStateChanged: appState => this.setState(appState)
      })
      
class App extends Component<{}> {
  componentDidMount() {
    
  }
  render() {
    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
