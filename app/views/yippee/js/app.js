var app = angular.module('yippee', ['ionic', 'study.controller', 'break.controller', 'login.controller',
  'friends.controller', 'yippee.services', 'yippee.filters', 'firebase', 'uiGmapgoogle-maps', 'ngCordova', 'cordova.custom', 'chat.controller',
   'chatroom.controller', 'ngIOS9UIWebViewPatch', 'monospaced.elastic', 'angularMoment', 'yippee.directives', 'nemLogging']);

var firebaseUrl = "https://vivid-inferno-2137.firebaseio.com/";

app.run(function($ionicPlatform, $rootScope, $location, Auth, $ionicLoading, $timeout, $localstorage) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
    
  $rootScope.firebaseUrl = firebaseUrl;
})

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, uiGmapGoogleMapApiProvider) {
  $stateProvider

  .state('tab', {
    url: '/tabs',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'loginController'
  })

  .state('tab.study', {
    url: '/study',
    views: {
      'study-tab': {
        templateUrl: 'templates/study.html',
        controller: 'studyController'
      }
    }
  })

  .state('tab.break', {
    url: '/break',
    abstract: true,
    views: {
      'break-tab': {
        templateUrl: 'templates/break.html',
        controller: 'breakController'
      }
    }
  })

  .state('tab.break.homepage', {
    url: '/home',
    views: {
      'break-tab': {
        templateUrl: 'templates/breakHome.html'
      }
    }
  })

  .state('tab.break.businesses', {
    url: '/businesses',
    views: {
      'break-tab': {
        templateUrl: 'templates/breakBusinesses.html'
      }
    }
  })

  .state('tab.break.business', {
    url: '/:business_id',
    views: {
      'break-tab': {
        templateUrl: 'templates/breakBusiness.html'
      }
    }
  })

  .state('tab.chatrooms', {
    url: '/chatrooms',
    cache: false,
    views: {
      'chatrooms-tab': {
        templateUrl: 'templates/chatrooms.html',
        controller: 'chatroomController'
      }
    }
  })

    .state('tab.friends', {
    url: '/friends',
    views: {
      'friends-tab': {
        templateUrl: 'templates/friends.html',
        controller: 'friendsController'
      }
    }
  })
    .state('tab.chat', {
      url: '/chatrooms/chat/:roomId',
      views: {
        'chatrooms-tab': {
          templateUrl:'templates/chat.html', 
         controller: 'chatController'
       }
      }
    })

    .state('tab.chatFriends', {
      url: '/friends/chat/:roomId',
      views: {
        'friends-tab': {
          templateUrl:'templates/chat.html', 
         controller: 'chatController'
       }
      }
    })


  // guarantees that angular-google-maps does not begin processing any directives until all of the Google Maps SDK is fully ready
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDRcklEWhDAnt970yewfzGLIZkK8OU8J3o',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });

  $urlRouterProvider.otherwise('/tabs/study');
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.tabs.style('striped');
  $ionicConfigProvider.backButton.text('');
  $ionicConfigProvider.backButton.previousTitleText('');
})

