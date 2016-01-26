'use strict';

angular.module('myResumeApp', [
    'ngRoute',
    'ui.bootstrap',
    'home.ctrl',
    'portfolioModal.ctrl',
    'scrolling',
    'ngAnimate'
])

.config(function($routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            controller: 'homeController',
            templateUrl: 'views/home.html'
        })

    .otherwise({
        redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
});
