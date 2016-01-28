angular.module('yippee.filters', [])

.filter('distance', function() {
    return function(input) {
        if (input >= 1000) {
            return (input / 1000).toFixed(2) + 'km';
        } else {
            return input + 'm';
        }
    }
})
