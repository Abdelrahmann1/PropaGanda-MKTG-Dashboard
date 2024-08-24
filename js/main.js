(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav : false
    });



    
})(jQuery);
document.addEventListener('DOMContentLoaded', function() {

    document.querySelectorAll('.upload-container').forEach(function(container) {
        const beforeUpload = container.querySelector('.before-upload');
        const afterUpload = container.querySelector('.after-upload');
        const fileInput = container.querySelector('.media-upload');
        const uploadedMedia = container.querySelector('.uploaded-media');

        if (beforeUpload) {
            beforeUpload.addEventListener('click', function() {
                if (fileInput) {
                    fileInput.click(); // Trigger the file input click
                }
            });
        }

        if (afterUpload) {
            afterUpload.addEventListener('click', function() {
                if (fileInput) {
                    fileInput.click(); // Allow picking a new file on click
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {

                        if (file.type.startsWith('video/')) {
                            const tempVideo = document.createElement('video');
                            tempVideo.src = e.target.result;

                            tempVideo.onloadedmetadata = function() {
                                if (tempVideo.duration <= 15) {
                                    alert('The video must be longer than 15 seconds.');
                                    fileInput.value = ''; // Clear the input
                                    return;
                                } else {
                                    if (uploadedMedia && uploadedMedia.tagName === 'VIDEO') {
                                        uploadedMedia.src = e.target.result;
                                        uploadedMedia.style.display = 'block';
                                    }
                                    if (beforeUpload && afterUpload) {
                                        beforeUpload.style.display = 'none';
                                        afterUpload.style.display = 'block';
                                    }
                                }
                            };
                        } else if (file.type.startsWith('image/')) {
                            const tempImage = document.createElement('img');
                            tempImage.src = e.target.result;
                        
                            tempImage.onload = function() {
                                const minWidth = 300;  // Example minimum width
                                const minHeight = 300; // Example minimum height
                        
                                if (tempImage.width < minWidth || tempImage.height < minHeight) {
                                    alert(`The image must be at least ${minWidth}px by ${minHeight}px.`);
                                    fileInput.value = ''; // Clear the input
                                    return;
                                } else {
                                    if (uploadedMedia && uploadedMedia.tagName === 'IMG') {
                                        uploadedMedia.src = e.target.result;
                                        uploadedMedia.style.display = 'block';
                                    }
                                    if (beforeUpload && afterUpload) {
                                        beforeUpload.style.display = 'none';
                                        afterUpload.style.display = 'block';
                                    }
                                }
                            };
                        }
                    };
                    reader.readAsDataURL(file); // Read the file as a data URL
                }
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {

})
document.addEventListener('DOMContentLoaded', function () {
    // Determine the current page
    const path = window.location.pathname;
    const isProfilePage = path === "/createProfile.html";
    const isPackagePage = path === "/create_packages.html";
    const isidentity = path === "/identity_verification.html";
    
    let progress = 0;
     if (isidentity) {
         if (localStorage.getItem('verify')) {
            progress =  100;
        }
    }
    if (isProfilePage) {
        if (localStorage.getItem('BasicInfo')) {
            progress = localStorage.getItem('reels') ? 100 : 50;
        }
        } 
    else if (isPackagePage) {
        if (localStorage.getItem('basicpackage')) {
            progress += 33.33;
        }
        if (localStorage.getItem('standardpackage')) {
            progress += 33.33;
        }
        if (localStorage.getItem('premiumpackage')) {
            progress += 33.33;
        }
        if (progress >= 99.99) {
            progress=100;
        }
    }
    
    // Get the progress bar element
    const progressBar = document.getElementById('pregresssbarcreate');
    
    if (progressBar) {
        // Set the width of the progress bar and the displayed percentage
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';
    
        // Update the aria-valuenow attribute for accessibility
        progressBar.setAttribute('aria-valuenow', progress);
    }

    // Get references to the icons
});
document.addEventListener('DOMContentLoaded', function () {
    // Call the function to update icons based on localStorage values
    if (localStorage.getItem('reels') && localStorage.getItem('BasicInfo')) {
        localStorage.setItem('createDone',true);
    }
    if (localStorage.getItem('standardpackage') && localStorage.getItem('basicpackage')&& localStorage.getItem('premiumpackage')) {
        localStorage.setItem('packageDone',true);
    }
    updateProgressIcons();

});

function updateProgressIcons() {
    // Get the progress status from localStorage
    const isBasicDone = localStorage.getItem('createDone') === 'true';
    const isStandardDone = localStorage.getItem('verify') === 'true';
    const isPremiumDone = localStorage.getItem('packageDone') === 'true';
    
    // Update icons for Basic Package
    // alert( isBasicDone)
    updateIcons('create', isBasicDone);
    
    // Update icons for Standard Package
    updateIcons('wallet', isStandardDone);
    
    // Update icons for Premium Package
    updateIcons('packages', isPremiumDone);
}

function updateIcons(packageType, isDone) {
    // Select the hourglass and check icons for the given package type
    const hourglassIcon = document.querySelector(`.${packageType}Hourglass`);
    const checkIcon = document.querySelector(`.${packageType}Check`);
    
    if (hourglassIcon && checkIcon) {
        if (isDone) {
            hourglassIcon.classList.add('d-none'); // Hide the hourglass icon
            checkIcon.classList.remove('d-none');  // Show the check icon
        } else {
            checkIcon.classList.add('d-none'); // Hide the check icon
            hourglassIcon.classList.remove('d-none');  // Show the hourglass icon
        }
    }
}

