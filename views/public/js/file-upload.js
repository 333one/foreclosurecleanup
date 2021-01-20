'use strict';

// setup

document.getElementById('button__submit').style.backgroundColor = 'var(--grey192)';
document.getElementById('button__submit').style.color = 'var(--white)';
document.getElementById('button__submit').disabled = true;
document.getElementById('button__submit').style.cursor = 'default';

let imageFile = document.querySelector('#imageFile');
let imageDisplay = document.querySelector('#imageDisplay');

let border = document.querySelector('#imageContainer');
let imageError = document.querySelector('#imageUploadError');

imageFile.addEventListener('input', function(event) {

    let uploadedFile = event.target.files[0];

    let fileName = uploadedFile.name;
    let validFileNames = [
        '.gif',
        '.jpg',
        '.jpeg',
        '.png'
    ];

    let isFileNameValid = checkIfFileNameValid(fileName, validFileNames);

    let bytesToMegabytes = 1048576;
    let uploadedFileSize = (uploadedFile.size / bytesToMegabytes).toFixed(2);
    let maximumFileSize = 1; // 5 megabytes

    let isFileSizeUnderLimit = uploadedFileSize < maximumFileSize ? true : false;


    if (isFileNameValid === false) {

        let errorText = `We are sorry but your image file, ${ fileName } is not saved in a format we can accept.  Please upload an image in jpg, png or gif format.`;
        addError(errorText);

    }

    if (isFileSizeUnderLimit === false) {

        let errorText = `We are sorry but your image file is ${ uploadedFileSize } megabytes which is over the maximum limit of ${ maximumFileSize } megabytes.  Please compress your image and try again or use a new image.`;

        addError(errorText);

    }

    if (isFileNameValid === true && isFileSizeUnderLimit === true) {

        let uploadedImage = new Image();
        uploadedImage.src = URL.createObjectURL(uploadedFile);

        uploadedImage.addEventListener('load', function getHeight(e) {

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

            document.getElementById('button__submit').style.backgroundColor = 'var(--grey32)';
            document.getElementById('button__submit').style.color = 'var(--gold)';
            document.getElementById('button__submit').disabled = false;
            document.getElementById('button__submit').style.cursor = 'pointer';

        });

        uploadedImage.removeEventListener(e.type, getHeight);

    }

});

function addError(errorText) {

    border.classList.add('-borderError');
    border.classList.remove('-bottomMarginMedium');

    imageError.classList.add('input__error');
    imageError.classList.add('-rightLeftMarginMedium__imageUpload');
    imageError.classList.add('-bottomMarginMedium');

    imageError.innerText = errorText;

    imageDisplay.setAttribute('width', 200);
    imageDisplay.setAttribute('height', 200);
    imageDisplay.src = 'images/image-upload-error.png';

}

function checkIfFileNameValid(fileName, validFileNames) {

    for (const value of validFileNames) {
        
        let fileNameCheck = fileName.endsWith(value);
        if (fileNameCheck === true) return true;
    
    }

    return false;

}

function removeError(errorText) {

    border.classList.remove('-borderError');
    border.classList.add('-bottomMarginMedium');

    imageError.classList.remove('input__error');
    imageError.classList.remove('-rightLeftMarginMedium__imageUpload');
    imageError.classList.remove('-bottomMarginMedium');

    imageError.innerText = errorText;

}