import React, { Component } from 'react';
import AddSongDialog from "../AddSongDialog/AddSongDialog";

class TitleAndNavigationBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addSong: false,
        };
        this.toggleSearch = this.toggleSearch.bind(this);
        this.toggleAddModal = this.toggleAddModal.bind(this);
    }

    toggleAddModal(){
        this.setState((prevState,props) => ({
            addSong: !prevState.addSong
        }));
    }

    toggleSearch(){
        console.log(!this.props.showSearchInput);
        this.props.setSearch(!this.props.showSearchInput)
    }

    render() {
        console.log("Title: render: " + this.props.showSearchInput);
        return (
            <div className="w3-card-4" style={{width: "100%",position: "fixed", top: "0"}}>
                <header className="w3-container w3-center w3-xlarge w3-text-white" style={{background: "#804000"}}>
                    <i className="fa fa-search"></i>
                    <b>הרפרטואר של נוי</b>
                    <i className="fa fa-search"></i>
                </header>
                <div style={{background: "#b35900"}}>
                    <div className="w3-bar w3-text-white">
                        <a className="w3-bar-item w3-button w3-border-left w3-right" onClick={this.toggleSearch}><i className="fa fa-search"></i></a>
                        <a className="w3-bar-item w3-button w3-right" onClick={this.toggleAddModal}><i className="fa fa-plus"></i></a>
                    </div>
                    {this.props.showSearchInput && <div className="w3-animate-opacity w3-container">
                        <input className="w3-input w3-round w3-border w3-right-align" placeholder="חפש שיר.." type="text"
                               style={{marginTop:"2px",marginBottom:"3px"}} onKeyUp={this.props.onKeyUp}/>
                    </div>}
                </div>
                {this.state.addSong && <AddSongDialog close={this.toggleAddModal}/>}
            </div>
        );
    }
}

export default TitleAndNavigationBar;