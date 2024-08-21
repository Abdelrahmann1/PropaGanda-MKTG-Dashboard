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

        console.log('Setting up container:', container); // Debug container setup

        if (beforeUpload) {
            beforeUpload.addEventListener('click', function() {
                if (fileInput) {
                    fileInput.click(); // Trigger the file input click
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];

                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        console.log('File loaded'); // Debug file loaded

                        if (file.type.startsWith('video/')) {
                            const tempVideo = document.createElement('video');
                            tempVideo.src = e.target.result;

                            // Check video duration after it's loaded
                            tempVideo.onloadedmetadata = function() {
                                if (tempVideo.duration <= 15) {
                                    alert('The video must be longer than 15 seconds.');
                                    fileInput.value = ''; // Clear the input
                                    return;
                                } else {
                                    // Display the video if duration is valid
                                    if (uploadedMedia && uploadedMedia.tagName === 'VIDEO') {
                                        uploadedMedia.src = e.target.result;
                                        uploadedMedia.style.display = 'block';
                                    }

                                    // Hide the before-upload container and show the after-upload container
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
    // Get the 'createaccprog' value from localStorage
    // const progress = localStorage.getItem('createaccprog');
    const progress = 99;
    // alert(0);
    // Parse it as an integer (assuming it's stored as a string)
    const progressValue = parseInt(progress, 10);

    // Get the progress bar element
    const progressBar = document.getElementById('pregresssbarcreate');

    // Set the width of the progress bar and the displayed percentage
    progressBar.style.width = progressValue + '%';
    progressBar.textContent = progressValue + '%';

    // Update the aria-valuenow attribute for accessibility
    progressBar.setAttribute('aria-valuenow', progressValue);
    // Get references to the icons
    const hourglassIcon = document.querySelector('.hourglass');
    const checkIcon = document.querySelector('.squarechecks');

    // Check the progress value
    if (progressValue >= 100) {
        hourglassIcon.classList.add('d-none'); // Hide the hourglass icon
        checkIcon.classList.remove('d-none');  // Show the check icon
    } else {
        checkIcon.classList.add('d-none'); // Hide the check icon
        hourglassIcon.classList.remove('d-none');  // Show the hourglass icon
    }
});
