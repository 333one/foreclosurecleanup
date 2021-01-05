"use strict";
    
    scrollToError();

    function scrollToError() {

        if (document.querySelector('#searchZipCodeError')) {

            document.querySelector('#searchZipCodeContainer').scrollIntoView({ behavior: "smooth" });

        } else if (document.querySelector('#searchRadiusError')) {

            document.querySelector('#searchRadiusContainer').scrollIntoView({ behavior: "smooth" });
            
        } else if (document.querySelector('#searchServicesError')) {

            document.querySelector('#searchServicesContainer').scrollIntoView({ behavior: "smooth" });
            
        } else if (document.querySelector('#privacyTermsError')) {

            document.querySelector('#privacyTermsContainer').scrollIntoView({ behavior: "smooth" });

        }

    }