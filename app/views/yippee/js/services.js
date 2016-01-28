angular.module('yippee.services', ['firebase'])

.factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
        var ref = new Firebase(firebaseUrl);
        return $firebaseAuth(ref);
}])

.factory("ref", [
    function () {
        var ref = new Firebase(firebaseUrl);
        return ref;
}])

.factory("amOnline", [
    function () {		
        var amOnline = new Firebase('https://vivid-inferno-2137.firebaseio.com/.info/connected');
        return amOnline;
}])

.factory("BreakLocation", ['$rootScope', '$q', function($rootScope, $q) {
    var breakLocation = {};

    var setBreakLocation = function(location) {
        breakLocation = location;
        $rootScope.$broadcast('breakStart', {
            breakLocation: location
        });
    }

    var getBreakLocation = function() {
        return breakLocation;
    }

    return {
        setBreakLocation: setBreakLocation,
        getBreakLocation: getBreakLocation,
    }
}])

.factory("OpenStreetMap", ['$http', function($http) {
    // http://wiki.openstreetmap.org/wiki/Nominatim 
    // Reverse geocode latitude and longitude to help get more precise location details
    // such as city, state, country, and street
    return {
        getUserLocation: function showLocation(lat, lon) {
            return $.getJSON('https://nominatim.openstreetmap.org/reverse?json_callback=?&format=json', 
                {
                    lat: lat, 
                    lon: lon
                }
            );
        }
    }
}])

.factory("YelpAPI", ["$http", "$q", function($http, $q) {
    // Yelp API credentials
    var generalSearchUrl  = 'https://api.yelp.com/v2/search?callback=JSON_CALLBACK';
    var businessSearchUrl = 'https://api.yelp.com/v2/business';
    var consumerKey       = '0dsChhAdbPmJmiMzFM9MLw';
    var consumerSecret    = '2ex-p5OtTzAubmRMZ6f4ztgs_kM';
    var token             = 'sqaj0I-au10iH6NmZWSnDI_KcGjD5m0r';
    var tokenSecret       = 'z4ASyanFqYZONzOikcMWGmD8xgw';

    // Generate an arbitrary number used only once in a cryptographic communication.
    var nonceGenerator = function(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for(var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    var setupSearch = function(url, filters) {
        var httpMethod = 'GET';
        var params = {
            callback: 'JSON_CALLBACK',
            oauth_consumer_key: consumerKey,
            oauth_token: token,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: new Date().getTime(),
            oauth_nonce: nonceGenerator(16)
        };

        for (filter in filters) {
            params[filter] = filters[filter];
        }

        var signature = oauthSignature.generate(httpMethod, url, params, consumerSecret, tokenSecret, { encodeSignature: false });

        params['oauth_signature'] = signature;

        return params;
    }

    return {
        search: function(filters, successCallback, errorCallback) {
            var params = setupSearch(generalSearchUrl, filters);
            
            $http.jsonp(generalSearchUrl, {params: params}).then(successCallback, errorCallback);
        },
        businessSearch: function(filters, successCallback, errorCallback) {
            var url = businessSearchUrl + '/' + filters.id + '?callback=JSON_CALLBACK';
            var params = setupSearch(url, null);

            $http.jsonp(url, {params: params}).then(successCallback, errorCallback);
        },
        multipleBusinessSearch: function(filters, successCallback, errorCallback) {
            console.log(filters);
            var jsonpCalls = [];
            var results = {
                data: {
                    businesses: []
                }
            };

            for (var i = 0; i < filters.ids.length; i++) {
                var url = businessSearchUrl + '/' + filters.ids[i] + '?callback=JSON_CALLBACK';
                var params = setupSearch(url, null);

                jsonpCalls.push($http.jsonp(url, {params: params}).then(function(response) {
                    console.log(response);
                    results.data.businesses.push(response.data);
                }, errorCallback));
            }
            
            $q.all(jsonpCalls).then(function() {
                console.log('all done!');
                successCallback(results);
            });
        }
    }
}])

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
          $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
          return JSON.parse($window.localStorage[key] || '{}');
        },
        removeItem: function(key){
        	$window.localStorage.removeItem(key);
        }
    }
}]);

