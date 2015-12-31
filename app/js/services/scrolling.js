angular.module('scrolling', [])

.service('anchorSmoothScroll', function() {
	
	this.scrollTo = function(id) {
		var elm = document.getElementById(id);
		var yoff = elm.offsetTop;
		console.log("yoff");
		window.scrollTo(0, yoff);
	}

})