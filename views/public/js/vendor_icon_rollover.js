"use strict";

document.getElementById('targetVendorIcon').addEventListener('mouseover', rollOverIcon);
document.getElementById('targetVendorIcon').addEventListener('mouseout', rollOffIcon);

document.getElementById('targetLogInOutText').addEventListener('mouseover', rollOverIcon);
document.getElementById('targetLogInOutText').addEventListener('mouseout', rollOffIcon);

function rollOverIcon() {
    document.getElementById('targetLogInOutText').style.color='var(--gold)';
    document.getElementById('targetVendorIcon').setAttribute('src', 'images/vendor_icon_gold.svg');
}

function rollOffIcon() {
    document.getElementById('targetLogInOutText').style.color='var(--white)';
    document.getElementById('targetLogInOutText').style.textDecoration='none';
    document.getElementById('targetVendorIcon').setAttribute('src', 'images/vendor_icon_white.svg');
}