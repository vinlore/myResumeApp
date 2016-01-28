angular.module('cordova.custom', [])
	.factory('$cordovaAudioHandler', function($q) {
		return {
			muteRinger: function () {
				var q = $q.defer();
				window.audioHandler.muteRinger(function(result) {
					console.log("muted");
					q.resolve(result);
				});
				return q.promise;
			},

			restoreRinger: function() {
				window.audioHandler.restoreRinger(function(result) {
				}, function (err) {
				});

			}
		};
	})