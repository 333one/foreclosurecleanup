'use strict';

function overXButton() {
    document.getElementById('xButton').setAttribute('src', 'images/x-white.svg');
}

function outXButton() {
    document.getElementById('xButton').setAttribute('src', 'images/x-black.svg');
}

function shutMessage() {
    document.getElementById('messageContainer').style.display = 'none';
}

if (document.getElementById('messageContainer')) {

    var blackX = new Image();
    blackX.src = 'images/x-black.svg';
    var whiteX = new Image();
    whiteX.src = 'images/x-white.svg';

    document.getElementById('xButtonContainer').innerHTML = '<img id="xButton" src="images/x-black.svg" alt="close button">';
    document.getElementById('messageContainer').addEventListener('mouseover', overXButton);
    document.getElementById('messageContainer').addEventListener('mouseout', outXButton);
    document.getElementById('messageContainer').addEventListener('click', shutMessage);
    document.getElementById('messageContainer').style.cursor = 'pointer';
}