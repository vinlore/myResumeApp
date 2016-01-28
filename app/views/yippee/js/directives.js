angular.module('yippee.directives', ['ionic'])
.directive('share', function($compile) {

	var template = '<div class="card white-bg" id="share-card"><a class="item clear-bg item-bg-image ui-sref=""><p><b>{{msg.details.name}}</b></p><h3>{{msg.details.location.address}}, {{msg.details.location.city}}</h3><h3>{{msg.details.phone}}</h3><img ng-src="{{msg.details.image_url}}"></a></div><span>Join me on a break here!</span>';

	return {
		restrict: 'A',
		scope: {
			msg: '='
		},
		link: function(scope, element, attrs) {
			if (typeof(scope.msg) === 'object') {
				element.html(template);
				$compile(element.contents())(scope);
			}
		}
	}
})

.directive('bottom', function($ionicScrollDelegate) {
	var viewScroll;

	return {
		restrict: 'A',
		scope: {
			chats: "="
		},
		link: function(scope, element, attrs) {
			scope.$watchCollection('chats', function(newVal) {
				if (newVal) {
					viewScroll = $ionicScrollDelegate.$getByHandle('scroller');
					viewScroll.scrollBottom(true);
				}
			})
		}
	}
})

.directive('keepKeyboardOpen', function($window) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var keyboardOpen = false;
			$window.addEventListener('native.keyboardshow', function(e) {
				keyboardOpen = true;
				element[0].focus();
			});
			$window.addEventListener('native.keyboardhide', function(e) {
				keyboardOpen = false;
				element[0].blur();
			});
			element[0].addEventListener('blur', function(e) {
				if (keyboardOpen) {
					element[0].focus();
				}
			}, true);
		}
	}
})