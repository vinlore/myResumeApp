'use strict';

angular.module('scrolling', [])

.service('anchorSmoothScroll', function() {
	
	this.scrollTo = function(id) {
		var elm = document.getElementById(id); // element to scroll to
		var navbar = document.getElementById('big-navbar'); // navbar
		var navoff = navbar.clientHeight; // navbar height
		var navbar2 = document.getElementById('mini-navbar'); // mini-navbar
		var menu = document.getElementById('collapsed-menu');
		var navoff2 = navbar2.clientHeight - menu.clientHeight; // mini-navbar height
		var yoff = elm.offsetTop - (navoff + navoff2); // position to scroll to with navbar 
		var curpos = window.pageYOffset; // current position in browser
		var distance = (yoff > curpos) ? yoff-curpos : curpos-yoff; // distance to scroll

		// scroll without smoothing if distance is small
		if (distance < 100) {
			window.scrollTo(0, yoff);
		}

		var speed = Math.round(distance/75); // scroll speed
		if (speed >= 20) speed = 20; // limit max scroll speed
		var stepSize = Math.round(distance/50); // step size
		var step = (yoff > curpos) ? curpos+stepSize : curpos-stepSize; // increment current position by step size
		var timer = 0; // speed factor
		var i = curpos;

		// scroll down
		if (yoff > curpos) {
			for (i; i<yoff; i+=stepSize) {
				setTimeout(stepTo, timer*speed, step); // scroll 
				step += stepSize; // increment position by step size
				if (step > yoff) step = yoff; // limit increment to scroll to position
				timer++;				
			}
		}

		// scroll up
		else {
			for (i; i>yoff; i-=stepSize) {
				setTimeout(stepTo, timer*speed, step); // scroll
				step -= stepSize; // decrement position by step size
				if (step < yoff) step = yoff; // limit decrement to scroll to position
				timer++;				
			}
		}

		// scroll function for timeout interval
		function stepTo(step) {
			window.scrollTo(0, step);
		}
	};

});