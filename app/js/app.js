'use strict';

angular.module('myResumeApp', [
    'ngRoute',
    'ui.bootstrap',
    'home.ctrl',
    'scrolling'
])

.config(function($routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            controller: 'homeController',
            templateUrl: 'templates/home.html'
        })

    .otherwise({
        redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
});
