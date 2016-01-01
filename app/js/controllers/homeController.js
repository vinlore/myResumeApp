angular.module('home.ctrl', [])
.controller('homeController', function($scope, anchorSmoothScroll, filterFilter) {

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

	$scope.courses = [
		{
			course: 'CPSC 410',
			title: 'Advanced Software Engineering'
		},
		{
			course: 'CPSC 404',
			title: 'Advanced Relational Databases'
		},
		{
			course: 'CPSC 340',
			title: 'Machine Learning and Data Mining'
		},
		{
			course: 'CPSC 304',
			title: 'Introduction to Relational Databases'
		},
		{
			course: 'CPSC 320',
			title: 'Intermediate Algorithm Design and Analysis'
		},
		{
			course: 'CPSC 310',
			title: 'Introduction to Software Engineering'
		},
		{
			course: 'CPSC 313',
			title: 'Computer Hardware and Operating Systems'
		},
		{
			course: 'BIOC 450',
			title: 'Membrane Biochemistry'
		},
		{
			course: 'BIOC 410',
			title: 'Nucleic Acids - Structure and Function'
		},
		{
			course: 'BIOC 403',
			title: 'Enzymology'
		},
		{
			course: 'BIOC 402',
			title: 'Proteins - Structure and Function'
		},
		{
			course: 'BIOC 303',
			title: 'Molecular Biochemistry'
		},
		{
			course: 'BIOC 301',
			title: 'Biochemistry Laboratory'
		},
		{
			course: 'CHEM 335',
			title: 'Chemistry Integrated Laboratory II'
		},
		{
			course: 'CHEM 315',
			title: 'Chemistry Integrated Laboratory I'
		},
		{
			course: 'CHEM 313',
			title: 'Advanced Organic Chemistry for the Life Sciences'
		},
		{
			course: 'CHEM 305',
			title: 'Biophysical Chemistry'
		}
	];

	$scope.catCourses = $scope.courses;

	$scope.coursesByCat = function(sub) {
		$scope.catCourses = filterFilter($scope.courses, {course: sub});
	};

	$scope.gotoElement = function(id) {
		anchorSmoothScroll.scrollTo(id);
	}

});
