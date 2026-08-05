// ============ BOOTSTRAP CAROUSEL FORCE INIT ============
document.addEventListener('DOMContentLoaded', function () {

  // Force init all carousels with auto-slide
  var carousels = document.querySelectorAll('.carousel');
  carousels.forEach(function (el) {
    var interval = parseInt(el.getAttribute('data-bs-interval')) || 3500;
    var bsCarousel = new bootstrap.Carousel(el, {
      interval: interval,
      ride: 'carousel',
      wrap: true,
      touch: true
    });
    bsCarousel.cycle();
  });

  // ============ SCROLL FADE-IN ANIMATION ============
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in-up').forEach(function (el) {
    observer.observe(el);
  });

  // ============ ANIMATED COUNTER ============
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var step = target / (duration / 16);
    var current = 0;
    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 16);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter-num').forEach(function (el) {
    counterObserver.observe(el);
  });

  // ============ FAQ ACCORDION ============
  document.querySelectorAll('.faq-item .question').forEach(function (q) {
    q.addEventListener('click', function () {
      var parent = this.closest('.faq-item');
      var isActive = parent.classList.contains('active');
      // close all
      document.querySelectorAll('.faq-item').forEach(function (item) {
        item.classList.remove('active');
        var ans = item.querySelector('.answer');
        if (ans) ans.style.display = 'none';
      });
      if (!isActive) {
        parent.classList.add('active');
        var ans = parent.querySelector('.answer');
        if (ans) ans.style.display = 'block';
      }
    });
  });

  // ============ READ MORE TOGGLE ============
  var buttons = document.querySelectorAll(
    '.button1,.button2,.button3,.button4,.button5,.button6,.button7,.button8,.button9,.button10'
  );
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = this.getAttribute('data-target');
      var el = document.getElementById(id);
      if (!el) return;
      if (el.style.display === 'none' || el.style.display === '') {
        el.style.display = 'block';
        this.textContent = 'Read Less ▲';
      } else {
        el.style.display = 'none';
        this.textContent = 'Read More ▼';
      }
    });
  });

  // ============ WHATSAPP ORDER LINKS ============
  document.querySelectorAll('[data-product]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var product = this.getAttribute('data-product');
      var msg = encodeURIComponent('Hello Al Kabeer, I would like to order: ' + product);
      window.open('https://api.whatsapp.com/send?phone=+97474467433&text=' + msg, '_blank');
    });
  });

  // ============ NAVBAR SCROLL EFFECT ============
  var navbar = document.querySelector('header');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        navbar.style.boxShadow = '0 4px 30px rgba(0,63,114,0.18)';
      } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0,63,114,0.10)';
      }
    });
  }

});
