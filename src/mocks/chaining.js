var abc = 4;

foo();
// directives wrapped in IIFEE don't work for now

(function () {

var something = require('something');

function someFunction () {

}

some.other.thing('abc');

angular.module('Something', [])
.directive('SomeDirective', function() {

}).directive('OtherDirective', function() {

});

})();
