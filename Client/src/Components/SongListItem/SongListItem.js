import React, {Component} from 'react';

export default class SongListItem extends React.Component {
    constructor(props) {
        super(props);
        this.sendSong = this.sendSong.bind(this);
    }

    sendSong() {
        this.props.onSelect(this.props.value);
    }
    render() {
        return (
            <div key={this.props.value} >
                <li className="w3-bar w3-border-white w3-border">
                    <a className="w3-bar-item w3-right" href={this.props.lyricsURL}
                       style={{width:"70%",paddingRight: "0px",textDecoration: "none"}}>{this.props.songName}</a>
                    <span className="w3-left w3-bar-item" style={{marginLeft: "0px", width: "10%"}}>
                        {this.props.votes > 0? this.props.votes: ""}
                    </span>
                    <span className="w3-left w3-border-white w3-border w3-brown w3-circle w3-button"
                           onClick={this.sendSong} style={{maxWidth:"15%"}}>
                        <i className="fas fa-hand-peace"></i>
                    </span>

                </li>
            </div>
        );
    }
}