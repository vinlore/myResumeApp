angular.module('home.ctrl', [])
.controller('homeController', function($scope) {

	$scope.languages = [
		'HTML/CSS', 'Javascript', 'Java', 'SQL', 'Matlab', 'R', 'C++', 'PHP', 'Python' 
	];

	$scope.laboratory = [
		'Media and buffer preparation',
		'Gel electrophoresis',
		'SDS-PAGE',
		'Restriction endonuclease digestion',
		'Protein purification',
		'PCR isolation and amplification',
		'Enzymatic assay',
		'Recombinant DNA preparation',
		'Bacterial transformations',
		'Dot blot',
		'DNA and protein spectrophotometry'
	];

});
