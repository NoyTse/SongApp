import React, { Component } from 'react';
import TitleAndNavigationBar from './Components/TitleAndNavigationBar/TitleAndNavigationBar'
import SongList from "./Components/SongList/SongList";
import SocketIOClient from 'socket.io-client'



class App extends Component {
    constructor(props){
        super(props);
        this.contentMargin = "0";
        this.state = {searchTxt: "", search : false};
        this.setSearch = this.setSearch.bind(this);

        this.socket = SocketIOClient();
        this.socket.emit('join',"web");
    };

    componentDidMount() {
        window.addEventListener("focus", function(event)
        {
            this.socket.emit('join',"web");
        }, false);
    }
    setSearch(val) {
        const newState = {search: val};
        if (!val) //hiding search input so clear filtering
            newState.searchTxt = "";
        this.setState(newState);
    }

  render() {
    console.log("App: render: " + this.state.search);
    return (
      <div className="App">
          <TitleAndNavigationBar setSearch={this.setSearch}  showSearchInput={this.state.search}
                                 onKeyUp={e =>{this.setState({searchTxt:e.target.value})}}/>

          <SongList marginTop={this.state.search? "135px" : "75px"} socket={this.socket} search={this.state.searchTxt}/>

      </div>
    );
  }
}

export default App;
