$(document).ready(function () {
  "use strict";

  var window_width = $(window).width(),
    window_height = window.innerHeight,
    header_height = $(".default-header").height(),
    header_height_static = $(".site-header.static").outerHeight(),
    fitscreen = window_height - header_height;

  $(".fullscreen").css("height", window_height)
  $(".fitscreen").css("height", fitscreen);

  if (document.getElementById("default-select")) {
    $('select').niceSelect();
  };

  $(document).ready(function () {

    $('html, body').hide();

    if (window.location.hash) {
      setTimeout(function () {
        $('html, body').scrollTop(0).show();
        $('html, body').animate({
          scrollTop: $(window.location.hash).offset().top
        }, 1000)
      }, 0);

    } else {
      $('html, body').show();
    }
  });

  // Header scroll class
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  })

  $("#username").text(localStorage.getItem('USERNAME'));
});