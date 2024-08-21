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


document.getElementById('upload-container').addEventListener('click', function() {
    document.getElementById('image-upload').click(); // Trigger the file input click
});

document.getElementById('image-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('uploaded-image').src = e.target.result;
            
            // Hide the before-upload container and show the after-upload container
            document.getElementById('before-upload').style.display = 'none';
            document.getElementById('after-upload').style.display = 'block';
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});



document.addEventListener('DOMContentLoaded', function () {
    // Get the 'createaccprog' value from localStorage
    // const progress = localStorage.getItem('createaccprog');
    const progress = 99;
    // alert(0);
    // Parse it as an integer (assuming it's stored as a string)
    const progressValue = parseInt(progress, 10);

    // Get the progress bar element
    const progressBar = document.getElementById('pregresssbar');

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
