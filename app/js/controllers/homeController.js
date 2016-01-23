angular.module('home.ctrl', [])
.controller('homeController', function($scope, anchorSmoothScroll, filterFilter) {

	$scope.isCollapsed = true;

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
		if (!$scope.isCollapsed) $scope.isCollapsed = true;
	}

	$scope.projects = [
		{
			name: "Datapi Registration App",
			description: "A web application designed for managing student registration and payments",
			functions: [
				"Register new clients to the database",
                "Make and edit payments in the database",
                "Make changes to existing client information",
                "Compiling monthly, weekly, daily reports. WIP"
			],
			built: "Built with AngularJS, Bootstrap CSS, Angular Bootstrap, and Firebase",
			images: [
				"assets/img/datapi/home.png",
				"assets/img/datapi/home2.png",
				"assets/img/datapi/payment.png",
				"assets/img/datapi/admin.png",
				"assets/img/datapi/adminSearch.png",
				"assets/img/datapi/student.png"
			]
		},
		{
			name: "Yippee",
			description: "A mobile (Android and iOS application that promotes a helathy lifestyle by encouraging students to schedule regular breaks in their busy study schedules.",
			functions: [
				"Set a study schedule with regular break intervals and lengths",
                "Automatically change phone ringer mode",
                "Notify user to take a break",
                "Utilize user's geolocation to query Yelp API for nearby businesses",
                "Create user accounts and add friends to view their statuses",
                "Send messages to friends",
                "Share businesses with friends"
			],
			built: "Built with Ionic framework, Cordova plugins, Ionic material CSS, Yelp API, OpenStreetMap, Firebase.",
			tested: "Tested using Karma with Jasmine, automated on TravisCI.",
			images: [
				"assets/img/yippee/studyhome.png",
				"assets/img/yippee/studyinput.png",
				"assets/img/yippee/studytimer.png",
				"assets/img/yippee/breaknotification.png",
				"assets/img/yippee/breaktimer.png",
				"assets/img/yippee/breakhome.png",
				"assets/img/yippee/breaklist.png",
				"assets/img/yippee/breakdetail.png",
				"assets/img/yippee/friends.png",
				"assets/img/yippee/chatrooms.png",
				"assets/img/yippee/chat.png"
			]
		},
		{
			name: "NHLCap",
			description: "A simple web database applicaiton for viewing the cpa salaries of players in the NHL.",
			built: "Built with AngularJS, PHP, and MySQL."
		}
	]

	$scope.experiences = [
		{
			job: "Tutor & Developer @ Datapi Learning Centre",
			url: "http://www.datapi.com",
			address: "772 Kingsway, Vancouver, BC",
			duration: "September 2015 to Present",
			jobs: [
				"Tutoring students K to 12 (1-on-1 or 1-on-2)",
				"Developing a web application for managing clients",
				"Making incremental changes on a currently existing software system"
			]
		},
		{
			job: "Lab Volunteer @ Rideout Lab",
			url: "http://rideoutlab.weebly.com",
			address: "2350 Health Sciences Mall, Vancouver, BC",
			duration: "August 2015 to Present",
			jobs: [
				"Regular housekeeping tasks",
				"Developing R scripts to process RNAseq data"
			]
		}
	];

	$scope.contactDetails = [
		{
			icon: "ion-android-mail",
			url: "mailto:vincent_lore@hotmail.com",
			text: "vincent_lore@hotmail.com"
		},
		{
			icon: "ion-social-google",
			url: "mailto:vincentlore93@gmail.com",
			text: "vincentlore93@gmail.com"
		},
		{
			icon: "ion-social-github",
			url: "https://github.com/vinlore",
			text: "Github"
		},
		{
			icon: "ion-social-linkedin-outline",
			url: "https://www.linkedin.com/in/vincent-lore-080729ba",
			text: "LinkedIn"
		},
		{
			icon: "ion-social-facebook",
			url: "https://www.facebook.com/vincentlore93",
			text: "Facebook"
		},
		{
			icon: "ion-social-skype",
			url: "skype:vincentlore?chat",
			text: "vincentlore"
		}
	];

});
