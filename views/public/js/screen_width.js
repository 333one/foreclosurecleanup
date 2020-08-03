'use strict';

let output = document.createElement('div');
output.setAttribute('id', 'jsOutput');

output.style.position = 'fixed';
output.style.top = 0;
output.style.left = 0;
output.style.width = '50px';
output.style.height = '20px';
output.style.fontSize = '14px';
output.style.backgroundColor = 'white';
output.style.opacity = .5;

document.body.appendChild(output);

addEventListener('resize', resizeOutput);
addEventListener('load', resizeOutput);

function resizeOutput() {
    document.getElementById('jsOutput').innerText = window.innerWidth;
}