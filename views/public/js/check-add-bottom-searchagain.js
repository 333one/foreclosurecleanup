"use strict";

let bounding = document.querySelector('#searchResultsRoot').getBoundingClientRect();

let isTopOutsideViewport = bounding.top < 0 ? true : false;
let isRightOutsideViewport = bounding.right > (window.innerWidth || document.body.clientWidth) ? true : false;
let isBottomOutsideViewport = bounding.bottom > (window.innerHeight || document.body.clientHeight) ? true : false;
let isLeftOutsideViewport = bounding.left < 0 ? true : false;

if (
    isTopOutsideViewport === true ||
    isRightOutsideViewport === true ||
    isBottomOutsideViewport === true ||
    isLeftOutsideViewport === true
    ) {
        document.querySelector('#bottomSearchAgain').style.display = 'block';
    }