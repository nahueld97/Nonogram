import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import Switch  from "./Switch";

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      resolvedGrid:null,
      rowClues: null,
      colClues: null,
      satisfiedRowClues:{},
      satisfiedColClues:{},
      waiting: false,
      mode:'#',
      win:false,
      solution:false,
      pista:false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
  }
  
    isWin(){
      let win = true;
      for (let i = 0; win && i < this.state.rowClues.length; i++) {
        win = this.state.satisfiedRowClues[i];
      }
      for (let i = 0; win && i < this.state.colClues.length; i++) {
        win = this.state.satisfiedColClues[i];
      }
      return win;
    }
  
  handlePengineCreate() {
    const queryS = 'init(PistasFilas, PistasColumns, Grilla)';
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        let rowClues = response['PistasFilas'];
        let colClues = response['PistasColumns'];
        let satisfiedRowClues = Object.assign({}, Array(rowClues.length).fill(false));
        let satisfiedColClues = Object.assign({}, Array(colClues.length).fill(false));
        this.setState({
          grid: response['Grilla'],
          rowClues,
          colClues,
          satisfiedRowClues,
          satisfiedColClues,
        });
        const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); // Remove quotes for variables.
        const PFilas = JSON.stringify(this.state.rowClues);
        const PCol= JSON.stringify(this.state.colClues);
        const query2 = 'solucion('+squaresS+','+PFilas+','+PCol+',GrillaResuelta)';
        this.pengine.query(query2, (success, response) => {
        if (success) {
          this.setState({
            resolvedGrid: response['GrillaResuelta'],
          });
          }
        })
      }
    })
  }

  handleClick(i, j) {
    // No action on click if we are waiting.
    if (this.state.waiting) {
      return;
    }
    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); // Remove quotes for variables.
    const PFilas = JSON.stringify(this.state.rowClues);
    const PCol= JSON.stringify(this.state.colClues);
    let mode = this.state.mode;
    //Si el modo pista esta activo cargo el proximo elemento a modificar desde la grilla resuelta
    if (this.state.pista) {
      mode = this.state.resolvedGrid[i][j];
      this.setState({pista: false});
    }
    const queryS = 'put("'+mode+'", [' + i + ',' + j + '], '+PFilas+', '+PCol+',' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        let grid = response['GrillaRes'];
        let satisfiedRowClues= Object.assign({},this.state.satisfiedRowClues);
        satisfiedRowClues[i] = response['FilaSat'];
        let satisfiedColClues= Object.assign({},this.state.satisfiedColClues);
        satisfiedColClues[j] = response['ColSat'];
        this.setState({
          grid,
          waiting: false,
          satisfiedRowClues,
          satisfiedColClues,
        });
        this.setState({win: this.isWin()});
      } else {
        this.setState({
          waiting: false
        });
      }
    });
  }

  toggle(){
    this.setState({mode: this.state.mode === '#' ? 'X' : '#'})
  }

  showSolution(){
    this.setState({solution: !this.state.solution})
  }

  setPista(){
    this.setState({pista: !this.state.pista})
  }

  render() {
    if (this.state.grid === null || this.state.resolvedGrid === null) {
      return null;
    }
    const statusText = this.state.win ? 'You Win!' : 'Keep playing!';
    return (
      <div className="game">
        <div className="board_game">
          <Switch empty="." switchState={() => this.showSolution()}/>
          <div>Mostrar Solucion</div>
          <div className = {`${this.state.solution ? "solution_board_game--show" : "solution_board_game--hide" }`}>
            <div className= "board2">
              <Board
                grid={this.state.resolvedGrid}
                rowClues={this.state.rowClues}
                colClues={this.state.colClues}
                onClick={(i, j) => {}}
                satisfiedRowClues = {Object.assign({}, Array(this.state.rowClues.length).fill(true))}
                satisfiedColClues = {Object.assign({}, Array(this.state.colClues.length).fill(true))}
              />
            </div>
            <Board
              grid={this.state.grid}
              rowClues={this.state.rowClues}
              colClues={this.state.colClues}
              onClick={(i, j) => {if(!this.state.solution) this.handleClick(i,j)}}
              satisfiedRowClues = {this.state.satisfiedRowClues}
              satisfiedColClues = {this.state.satisfiedColClues}
              win = {this.state.win}
            />
          </div>
          <div className="tools">
            <Switch switchState={() => this.toggle()}/>
            <button onClick={() => this.setPista()} disabled={this.state.pista ? "x" : null}>pista</button>
          </div>
        </div>
        <div className="gameInfo">
          {statusText}
        </div>
      </div>
    );
  }
}

export default Game;
