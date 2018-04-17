import React, {Component} from 'react';
import SongListItem from "../SongListItem/SongListItem";
/*import SocketIOClient from 'socket.io-client'*/





export default class SongList extends React.Component {
    constructor(props){
        super(props);
        this.state = {response: ''};
        this.mSongArray = '';
        this.songSelected = this.songSelected.bind(this);
        this.fetchSongList();

        /*this.socket = SocketIOClient();
        this.socket.emit('join',{user: "web"});*/
        this.props.socket.on('refreshSongList',(songList)=>{
            console.log(songList);
            this.setState({response: songList})
        });
    }
    fetchSongList() {
        this.callApi()
            .then(res => this.setState({ response: res}))
            .catch(err => console.log(err));
    }

    callApi = async () => {
        const response = await fetch('/api/songList');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    songSelected(id) {
        this.props.socket.emit('vote',this.mSongArray[id]._id);
    }

    render() {
        var marginTopStyle = {marginTop : this.props.marginTop};

        if(this.state.response != ''){
            this.mSongArray = this.state.response.map((x) => x); //adding votes member
            this.mSongArray.sort((a,b) => b.Votes - a.Votes);

            if (this.props.search !== '') {
                this.mSongArray = this.mSongArray.filter(song => song.SongName.includes(this.props.search));
            }


            var i = 0;
            var songsUI = this.mSongArray.map((song) => {
                return <SongListItem key={i} value={i++} songName={song.SongName} lyricsURL={song.LyricsURL}
                            onSelect={this.songSelected} votes={song.Votes}/>
            });
        }

        return(
            <ul className="w3-ul" style={marginTopStyle}>{songsUI}</ul>
        );
    }


}