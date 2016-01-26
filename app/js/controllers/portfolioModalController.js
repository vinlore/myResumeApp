angular.module('portfolioModal.ctrl', [])
.controller('portfolioModalController', function($scope, $uibModalInstance, images) {
	
	$scope.images = images;
	console.log(images);
})