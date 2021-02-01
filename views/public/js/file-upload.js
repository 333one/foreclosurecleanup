'use strict';

let buttonSubmit = document.querySelector('#buttonSubmit');
let buttonUndo = document.querySelector('#undoButton');
let imageContainer = document.querySelector('#imageContainer');
let imageInteriorContainer = document.querySelector('#imageInteriorContainer');
let imageDisplay = document.querySelector('#imageDisplay');
let imageError = document.querySelector('#imageError');
let companyLogo = document.querySelector('#companyLogo');
let imageSelect = document.querySelector('#imageSelect');
let leftColumnExterior = document.querySelector('#leftColumnExterior');
let leftColumnInterior = document.querySelector('#leftColumnInterior');
let rightColumn = document.querySelector('#rightColumn');
let uploadInstructions = document.querySelector('#uploadInstructions');

let addHighlightActions = ['dragenter', 'dragover'];
let removeHighlightActions = ['dragleave', 'drop'];

// If JS is turned on enable these, otherwise noscript version is used.
enableImageInteriorContainer();
enableUploadInstructions();

// Start disabled
disableSubmitButton(buttonSubmit);

companyLogo.addEventListener('input', uploadFileRoutine);

addHighlightActions.forEach(function(element) {
    leftColumnInterior.addEventListener(element, addHighlight);
});

removeHighlightActions.forEach(function(element) {
    leftColumnInterior.addEventListener(element, removeHighlight);
});

// Main function
function uploadFileRoutine(e) {

    if (e.target.files[0]) {

        let uploadedFile = e.target.files[0];

        let fileName = uploadedFile.name;
        let fileSize = uploadedFile.size;
    
        let isFileNameValid = checkIfFileNameValid(fileName);
        let fileSizeUnderLimitObject = checkIfFileSizeUnderLimit(fileSize);
    
        if (isFileNameValid === false || fileSizeUnderLimitObject.isFileSizeUnderLimit === false) {
    
            let errorText = getErrorText(isFileNameValid, fileName, fileSizeUnderLimitObject);
            displayError(errorText);
            removeUndoButton(e);
            return;
    
        }
    
        // no errors gets you here
        createDisplayImage(e, uploadedFile);

    }

}

// All other functions
function addHighlight() {

    leftColumnInterior.classList.add('-greenBorder');
    leftColumnExterior.classList.add('-greenBorder');

}

function removeHighlight() {

    leftColumnInterior.classList.remove('-greenBorder');
    leftColumnExterior.classList.remove('-greenBorder');

}

function checkIfFileNameValid(fileName) {

    let validFileNames = ['.jpg', '.jpeg', '.png'];

    for (const value of validFileNames) {
        
        let fileNameCheck = fileName.endsWith(value);
        if (fileNameCheck === true) return true;
    
    }

    return false;

}

function checkIfFileSizeUnderLimit(fileSize) {

    let bytesToMegabytes = 1048576;

    let maximumFileSize = 5; // 5 megabytes
    let fileSizeInMegabytes = (fileSize / bytesToMegabytes).toFixed(2);
    let isFileSizeUnderLimit = fileSizeInMegabytes < maximumFileSize ? true : false;

    return { maximumFileSize, fileSizeInMegabytes, isFileSizeUnderLimit } ;        

}

function createDisplayImage(e, uploadedFile) {

    let uploadedImage = new Image();
    uploadedImage.src = URL.createObjectURL(uploadedFile);

    uploadedImage.addEventListener('load', function(e) {

        removeError();
        displayImage(uploadedImage);
        enableSubmitButton(buttonSubmit);
        removeGreyBackground();
        displayUndoButton();

    });

}

function disableSubmitButton(buttonToDisable) {

    buttonToDisable.style.backgroundColor = 'var(--grey192)';
    buttonToDisable.style.color = 'var(--white)';
    buttonToDisable.disabled = true;
    buttonToDisable.style.cursor = 'default';

}

function displayError(errorText) {

    imageContainer.classList.remove('-borderClear');
    imageContainer.classList.remove('-marginBottomFour');
    imageContainer.classList.add('-borderError');

    imageError.classList.add('input__error');
    imageError.classList.add('-marginBottomFour');
    imageError.innerText = errorText;

    imageDisplay.setAttribute('width', 200);
    imageDisplay.setAttribute('height', 200);
    imageDisplay.src = 'images/image-upload-error.png';

}

function displayImage(uploadedImage) {

    let imageWidth = uploadedImage.naturalWidth;
    let imageHeight = uploadedImage.naturalHeight;
    
    let displayWidth, displayHeight;

    if (imageWidth === imageHeight) {

        displayWidth = 200;
        displayHeight = 200;

    } else if (imageWidth > imageHeight) {

        displayWidth = 200;
        displayHeight = Math.round(imageHeight/imageWidth * 200);

    } else {

        displayWidth = Math.round(imageWidth/imageHeight * 200);
        displayHeight = 200;
    }

    imageDisplay.setAttribute('width', displayWidth);
    imageDisplay.setAttribute('height', displayHeight);
    imageDisplay.src = uploadedImage.src;

}

function displayUndoButton() {

    buttonUndo.style.visibility = 'visible';
    buttonUndo.addEventListener('click', removeImageClearButtons);

}

function enableImageInteriorContainer() {

    imageInteriorContainer.style.display = 'flex';

}

function enableUploadInstructions() {

    uploadInstructions.style.display = 'block';

}

function enableSubmitButton(buttonToEnable) {

    buttonToEnable.style.backgroundColor = 'var(--grey32)';
    buttonToEnable.style.color = 'var(--gold)';
    buttonToEnable.disabled = false;
    buttonToEnable.style.cursor = 'pointer';

}

function getErrorText(isFileNameValid, fileName, fileSizeUnderLimitObject) {

    let errorText;

    if (isFileNameValid === false) {

        errorText = `Your file, ${ fileName } is not saved in a format we can accept.  Please upload an image in jpg or png format.`;
        
        return errorText;

    }

    let { maximumFileSize, fileSizeInMegabytes, isFileSizeUnderLimit } = fileSizeUnderLimitObject;

    if (isFileSizeUnderLimit === false) {

        errorText = `Your image file, ${ fileName } is ${ fileSizeInMegabytes } megabytes which is over the maximum limit of ${ maximumFileSize } megabytes.  Please compress your image and try again or select a new image.`;

        return errorText;

    }

}

function removeError() {

    imageContainer.classList.remove('-borderError');
    imageContainer.classList.add('-borderClear');
    imageContainer.classList.add('-marginBottomFour');

    imageError.classList.remove('input__error');
    imageError.classList.remove('-marginBottomFour');
    imageError.innerText = '';

}

function returnToGreyBackground() {

    rightColumn.classList.remove('-whiteBackground');

}

function removeGreyBackground() {

    rightColumn.classList.add('-whiteBackground');

}

function removeImage() {

    imageDisplay.setAttribute('width', 0);
    imageDisplay.setAttribute('height', 0);
    imageDisplay.src = '';

    // This has to be removed as well or it sits in the cache.
    companyLogo.value = '';
    
}

function removeImageClearButtons(e) {

    removeImage();
    returnToGreyBackground();
    removeUndoButton(e);
    disableSubmitButton(buttonSubmit);

}

function removeUndoButton(e) {

    buttonUndo.removeEventListener(e.type, removeImageClearButtons);
    buttonUndo.style.visibility = 'hidden';

}