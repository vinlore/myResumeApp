var app = angular.module('break.controller', ['ionic', 'firebase', 'yippee.filters', 'yippee.services', 'ionic-material']);

app.controller('breakController', ['$rootScope', '$scope', '$http', '$ionicPlatform', '$cordovaGeolocation', '$ionicLoading', '$state', '$ionicModal', '$ionicPopup', 'uiGmapGoogleMapApi', 'ionicMaterialMotion', 'OpenStreetMap', 'YelpAPI', 'BreakLocation', '$firebase',function($rootScope, $scope, $http, $ionicPlatform, $cordovaGeolocation, $ionicLoading, $state, $ionicModal, $ionicPopup, uiGmapGoogleMapApi, ionicMaterialMotion, OpenStreetMap, YelpAPI, BreakLocation, $firebase) {

    'use strict';

    $scope.categories = {
        nearby: {
            title: 'Nearby',
            type: 'food',
            subtitle: 'Find a place around the corner',
            img: 'nearby.png',
            sort: 1,
            radius_filter: 5000
        },
        restaurants: {
            title: 'Restaurants',
            type: 'restaurants',
            subtitle: 'Grab a bite to eat',
            img: 'cafe.jpg'
        },
        coffee: {
            title: 'Coffee',
            type: 'coffee',
            subtitle: 'Get your dose of caffeine',
            img: 'coffee.jpg'
        },
        parks: {
            title:'Parks',
            type: 'parks',
            subtitle: 'Refresh yourself with a walk',
            img: 'park.jpg'
        }
    };

    // Default settings
    $scope.settings = {
        distance : 10000, // radius in meters
        sortBy : 1 // 1 for distance, 2 for highest rated
    };

    $scope.searchTerm = '';
    $scope.results = {};
    $scope.searchLimit = '20';

    $scope.noConnection = false;

    $scope.countryCode = '';
    $scope.friendsToShare = {};

    $scope.updateUserLocation = function() {
        var posOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        ionic.Platform.ready(function(){
            uiGmapGoogleMapApi.then(function(maps) {
                $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 15 };
            });
            
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
            });

            var errorPopup = function showPopup() {
                $ionicPopup.show({
                    title: 'Geolocation Error',
                    template: 'Unable to locate device',
                    cssClass: 'break-popup-confirm',
                    scope: $scope,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-positive'
                        }
                    ]
                });
            };
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                $scope.noConnection = false;
                $scope.userLat = position.coords.latitude;
                $scope.userLng = position.coords.longitude;

                OpenStreetMap.getUserLocation($scope.userLat, $scope.userLng).then(function(data) {
                    if (data.error) {
                        $scope.noConnection = true;
                        errorPopup();
                    } else {
                        $scope.countryCode = data.address.country_code;
                        $scope.location = '';
                        $scope.location += data.address.road ? data.address.road + ', ' : '';
                        $scope.location += data.address.suburb ? data.address.suburb + ', ' : '';
                        $scope.location += data.address.city ? data.address.city + ', ' : '';
                        $scope.location += data.address.state ? data.address.state + ', ' : '';
                        $scope.location += data.address.country ? data.address.country : '';
                    }
                    $ionicLoading.hide();
                }, function(error) {
                    $scope.noConnection = true;
                    $ionicLoading.hide();
                    errorPopup();
                });
            }, function(error) {
                $scope.noConnection = true;
                $ionicLoading.hide();
                errorPopup();
            });
        });
    };

    $scope.updateSettings = function(distance, sorting) {
        $scope.closeSettingsModal();

        if ((distance < 0 || distance > 40000) || (sorting != 1 && sorting != 2)) {
            $ionicPopup.show({
                title: 'Invalid values',
                template: 'Those values are out of range',
                cssClass: 'break-popup-confirm',
                scope: $scope,
                buttons: [
                    { text: 'OK' }
                ]
            });
        } else {
            $scope.settings.distance = distance ? parseFloat(distance) : 10000;
            $scope.settings.sortBy = sorting ? parseFloat(sorting) : 1;
        }
    };

    $scope.categoryRetrieve = function(category) {
        var params = {
            category_filter: category.type
        };

        // override params for "nearby" category
        if (category.hasOwnProperty('sort')) {
            params.sort = category.sort;
        } 
        if (category.hasOwnProperty('radius_filter')) {
            params.radius_filter = category.radius_filter;
        }

        doYelpRequest(params, 'tab.break.businesses', 'general');
    };

    $scope.generalSearch = function(searchTerm) {
        // Default to a nearby search if nothing entered
        if (searchTerm == '') {
            $scope.categoryRetrieve($scope.categories.nearby);
            return;
        }

        var params = {
            term: searchTerm
        };
        doYelpRequest(params, 'tab.break.businesses', 'general');
    };

    $scope.businessSearch = function(businessId) {
        if ($scope.countryCode == '') {
            $ionicPopup.show({
                title: 'Geolocation Error',
                template: 'Unable to locate device',
                cssClass: 'break-popup-confirm',
                scope: $scope,
                buttons: [
                    {
                        text: '<b>OK</b>',
                        type: 'button-positive'
                    }
                ]
            });

            return;
        }
        var params = {
            cc: $scope.countryCode.toUpperCase(),
            id: businessId
        };

        doYelpRequest(params, 'tab.break.businesses', 'business');
    };

    $scope.friendsLastBreakLocations = function() {
        var authDataUid = $rootScope.uid;
        var ref = new Firebase("https://vivid-inferno-2137.firebaseio.com/");
        var businessIds = [];
        var friendIds = [];
        var params = {};
        var deferred = $.Deferred();

        if (authDataUid === null || typeof authDataUid === 'undefined') {
            $ionicPopup.show({
                title: 'Please login',
                template: 'Login before sharing a location',
                cssClass: 'break-popup-confirm',
                scope: $scope,
                buttons: [
                    { text: 'OK' }
                ]
            });
            $scope.closeShareModal();
            return;
        }

        ref.child('friendLists').child('' + authDataUid).once('value', function (friendSnapshots) {
            friendSnapshots.forEach(function (friend) {
                var friendId = friend.key();
                friendIds.push(friendId);
            });
            deferred.resolve();
        });

        deferred.then(function() {
            ref.child("users").once('value', function(userSnapshots) {
                userSnapshots.forEach(function(user) {
                    var userId = user.key();
                    var businessId = user.child('lastBreakLocation').val();
                    if (friendIds.indexOf(userId) > -1 && businessId) {
                        businessIds.push(businessId);
                    }
                });
                if (businessIds.length < 1) {
                    $ionicPopup.show({
                        title: 'No locations found',
                        template: "Looks like your friends don't take breaks!",
                        cssClass: 'break-popup-confirm',
                        scope: $scope,
                        buttons: [
                            { text: 'OK' }
                        ]
                    });
                } else {
                    params.ids = businessIds
                    doYelpRequest(params, 'tab.break.businesses', 'multipleBusiness');
                }
            });
        });
    };

    $scope.navToBusiness = function(businessDetails) {
        // Some businesses don't have an image url
        if (!businessDetails.image_url) {
            businessDetails.image_url = "img/placeholder.png";
        }
        if (!businessDetails.phone) {
            businessDetails.phone = '';
        }

        $scope.business = {
            details: businessDetails
        };

        $scope.businessName = businessDetails.name;
        if ($scope.map) {
            $scope.map.center.latitude = businessDetails.location.coordinate.latitude;
            $scope.map.center.longitude = businessDetails.location.coordinate.longitude;
            $scope.map.marker = {
                idKey: businessDetails.id,
                coords: {
                    latitude: $scope.map.center.latitude,
                    longitude: $scope.map.center.longitude
                },
                options: {
                    title: 'Business',
                    animation: 'bounce'
                }
            };
        }

        $state.go('tab.break.business', { business_id: businessDetails.id });
    };

    $scope.friendSelected = function(friend) {
        var id = friend.$id;
        if ($scope.friendsToShare.hasOwnProperty(id)) {
            delete $scope.friendsToShare[id];
        } else {
            $scope.friendsToShare[id] = friend;
        }
    };

    $scope.shareBreakLocation = function() {
        var ref         = new Firebase("https://vivid-inferno-2137.firebaseio.com/");
        var authDataUid = $rootScope.uid;
        var found       = false;
        var length      = 0;
        var details     = $scope.business.details;

        var businessObj = {
            details: {
                image_url: (details.image_url) ? details.image_url : null,
                name: $scope.business.details.name,
                location: {
                    address: (details.location.address[0]) ? details.location.address[0] : null,
                    city: details.location.city
                },
                phone: (details.display_phone) ? details.display_phone : null
            }
        }

        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Sharing!'
        });

        if (authDataUid === null || typeof authDataUid === 'undefined') {
            $ionicPopup.show({
                title: 'Please login',
                template: 'Login before sharing a location',
                cssClass: 'break-popup-confirm',
                scope: $scope,
                buttons: [
                    { text: 'OK' }
                ]
            });
            
            $scope.closeShareModal();
            $ionicLoading.hide();
            return;
        }

        length = Object.keys($scope.friendsToShare).length;

        if (length === 0) {
            $ionicPopup.show({
                title: 'Please select at least one friend',
                template: 'Choose a friend from the list',
                cssClass: 'break-popup-confirm',
                scope: $scope,
                buttons: [
                    { text: 'OK' }
                ]
            });
            
            $scope.closeShareModal();
            $ionicLoading.hide();
            return;
        }

        var oneOnOneConversation = false;
        var oneOnOneChatID = '';

        if (length === 1) {
            ref.child("users").child("" + authDataUid).child("chats").once('value', function(chatsSnapshot) {
                chatsSnapshot.forEach(function(chatSnapshot) {
                    var chatID = chatSnapshot.child("num").val().toString();
                    ref.child("rooms").child(chatID).child("users").once('value', function(chatUsersSnapshot) {
                        var numUsers = chatUsersSnapshot.numChildren();
                        if (numUsers == 2) {
                            chatUsersSnapshot.forEach(function(userSnapshot) {
                                var key = userSnapshot.key();
                                if ($scope.friendsToShare[key]) {
                                    oneOnOneChatID = chatID;
                                    oneOnOneConversation = true;
                                }
                            });
                        }
                        
                    });
                });
            });
        }

        if (oneOnOneConversation) {
            ref.child("rooms").child(oneOnOneChatID).child("chats").push({
                from: $rootScope.displayName,
                message: businessObj,
                createdAt: Firebase.ServerValue.TIMESTAMP
            }, function(error) {
                $scope.closeShareModal();
                $ionicLoading.hide();
                $state.go('tab.chat', {
                    roomId: oneOnOneChatID
                });
            });
        } else {
            ref.child("roomcount").child("num").once('value', function (snapshot) {
                var id = snapshot.val();
                var newRoomCount = id + 1;

                ref.child("roomcount").set({
                    num: newRoomCount
                }, function(error) {
                    if (error) {
                        $ionicLoading.hide();
                    }
                });
                ref.child("rooms").child('' + id).set({
                    id: id
                }, function(error) {
                    if (error) {
                        $ionicLoading.hide();
                    } else {
                        addSelf();
                    }
                });
                var addSelf = function() {
                    ref.child('rooms').child('' + id).child('users').child('' + authDataUid).set({
                        name: $rootScope.displayName
                    }, function(error) {
                        if (error) {
                            $ionicLoading.hide();
                        } else {
                            addChat();
                        }
                    });
                };
                var addChat = function() {
                    ref.child('users').child('' + authDataUid).child('chats').push({
                        num: id
                    }, function(error) {
                        if (error) {
                            $ionicLoading.hide();
                        } else {
                            sendMessage();
                        }
                    });
                };
                var sendMessage = function() {
                    ref.child('rooms').child('' + id).child('chats').push({
                        from: $rootScope.displayName,
                        message: businessObj,
                        createdAt: Firebase.ServerValue.TIMESTAMP
                    }, function(error) {
                        if (error) {
                            $ionicLoading.hide();
                        } else {
                            addFriendsToChat();
                        }
                    });
                };
                var addFriendsToChat = function() {
                    ref.child('friendLists').child('' + authDataUid).once('value', function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key();
                            var displayName = childSnapshot.child("friendDispName").val();
                            if ($scope.friendsToShare[key]) {
                                ref.child('users').child('' + key).child('chats').push({
                                    num: id
                                }, function(error) {
                                    if (error) {
                                        $ionicLoading.hide();
                                    } else {
                                        addUserToRoom();
                                    }
                                });
                                var addUserToRoom = function() {
                                    ref.child('rooms').child('' + id).child('users').child('' + key).set({
                                        name: displayName
                                    }, function(error) {
                                        if (error) {
                                            $ionicLoading.hide();
                                        } else {
                                            $scope.closeShareModal();
                                            $ionicLoading.hide();
                                            $state.go('tab.chat', {
                                                roomId: id
                                            });
                                        }
                                    });
                                };
                            }
                            $ionicLoading.hide();
                        });
                    });
                };
            });
        }
    };

    // Settings Modal
    $ionicModal.fromTemplateUrl('templates/breakSettings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.settingsModal = modal;
    });
    $scope.openSettingsModal = function() {
        $scope.settingsModal.show();
    };
    $scope.closeSettingsModal = function() {
        $scope.settingsModal.hide();
    };
    $scope.$on('$destroy', function() {
        $scope.settingsModal.remove();
    });

    // Share Break Location Modal
    $scope.openShareModal = function() {
        $ionicModal.fromTemplateUrl('templates/breakShareLocation.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.shareModal = modal;
            $scope.friends = $rootScope.friends;
            $scope.shareModal.show();
        });
    };
    $scope.closeShareModal = function() {
        $scope.friendsToShare = {};
        $scope.shareModal.hide();
        $scope.shareModal.remove();
    };
    $scope.$on('$destroy', function() {
        $scope.shareModal.remove();
    });

    // Break location confirmation
    $scope.showConfirm = function(location) {
        $ionicPopup.show({
            title: 'Setting Break Location',
            template: 'Are you sure you want to break here?',
            cssClass: 'break-popup-confirm',
            scope: $scope,
            buttons: [
                { text: 'No' },
                {
                    text: '<b>Yes</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        BreakLocation.setBreakLocation(location);
                    }
                }
            ]
        });
    };

    var init = function() {
        $scope.updateUserLocation();
    };

    // Initialize user's location
    init();

    var doYelpRequest = function(searchParams, nextState, searchType) {
        if ($scope.noConnection) {
            $ionicPopup.show({
                title: 'Geolocation Error',
                template: 'Unable to locate device',
                cssClass: 'break-popup-confirm',
                scope: $scope,
                buttons: [
                    {
                        text: '<b>OK</b>',
                        type: 'button-positive'
                    }
                ]
            });
            return;
        }

        $scope.results = {};
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Searching!'
        });

        var params = {};
        var successCallback;
        var errorCallback;

        switch(searchType) {
            case 'general':
                params.cll = $scope.userLat.toString() + ',' + $scope.userLng.toString();
                params.location = $scope.location;
                params.limit = $scope.searchLimit;
                params.sort = $scope.settings.sortBy;
                params.radius_filter = $scope.settings.distance;

                successCallback = function success(response) {
                    $scope.results = {
                        businesses: response.data.businesses
                    };
                    $ionicLoading.hide();
                    $state.go(nextState);
                    ripple();
                };
                break;
            case 'business':
                successCallback = function success(response) {
                    response.data.businesses = [];
                    response.data.businesses.push(response.data);

                    $scope.results = {
                        businesses: response.data.businesses
                    };
                    $ionicLoading.hide();
                    $state.go(nextState);
                    ripple();
                };
                break;
            case 'multipleBusiness':
                successCallback = function success(response) {
                    $scope.results = {
                        businesses: response.data.businesses
                    }
                    $ionicLoading.hide();
                    $state.go(nextState);
                    ripple();
                };
                break;
        }

        errorCallback = function error(response) {
            $ionicLoading.hide();
        };

        for (var param in searchParams) {
            params[param] = searchParams[param];
        }

        switch(searchType) {
            case 'general':
                YelpAPI.search(params, successCallback, errorCallback);
                break;
            case 'business':
                YelpAPI.businessSearch(params, successCallback, errorCallback);
                break;
            case 'multipleBusiness':
                YelpAPI.multipleBusinessSearch(params, successCallback, errorCallback);
                break;
        }
    };

    var reset = function() {
        var inClass = document.querySelectorAll('.in');
        for (var i = 0; i < inClass.length; i++) {
            inClass[i].classList.remove('in');
            inClass[i].removeAttribute('style');
        }
        var done = document.querySelectorAll('.done');
        for (var i = 0; i < done.length; i++) {
            done[i].classList.remove('done');
            done[i].removeAttribute('style');
        }
        var ionList = document.getElementsByTagName('ion-list');
        for (var i = 0; i < ionList.length; i++) {
            var toRemove = ionList[i].className;
            if (/animate-/.test(toRemove)) {
                ionList[i].className = ionList[i].className.replace(/(?:^|\s)animate-\S*(?:$|\s)/, '');
            }
        }
    };

    // Business list loading effect
    var ripple = function() {
        reset();
        document.getElementsByTagName('ion-list')[0].className += ' animate-ripple';
        setTimeout(function() {
            ionicMaterialMotion.ripple();
        }, 500);
    };
}]);