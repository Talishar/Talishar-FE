import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import { Board } from './game/board';
import './App.css';

function App() {
  return (
    <div className="App">
      <Board />
    </div>
  );
}

export default App;
