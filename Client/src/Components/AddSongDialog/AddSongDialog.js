import React, { Component } from 'react';

class AddSongDialog extends React.Component {
    constructor(props) {
        super(props);

        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside(event) {
        // Get the modal
        var modal = document.getElementById('addSongDialog');

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target === modal) {
            modal.style.display = "none";
            }
        }
        this.props.close();
    }

    render() {
        return(
            <div id="addSongDialog" class="w3-modal" style={{display:'block'}}>
                <div class="w3-modal-content w3-animate-opacity w3-card-4">
                    <header class="w3-container w3-teal">
                        <h2>Modal Header</h2>
                    </header>
                    <div class="w3-container">
                        <p>Some text..</p>
                        <p>Some text..</p>
                    </div>
                    <footer class="w3-container w3-teal">
                        <p>Modal Footer</p>
                    </footer>
                </div>
            </div>

    );
    }
}

export default AddSongDialog;