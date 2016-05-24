(function() {
  'use strict';



  angular
    .module('GPSCloud').filter('propsFilter', function() {
    return function(items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function(item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    }
  });


  angular.module('GPSCloud')
    .directive('uiRequired', function() {
      return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
          ctrl.$validators.required = function(modelValue, viewValue) {
            return !((viewValue && viewValue.length === 0 || false) && attrs.uiRequired === 'true');
          };

          attrs.$observe('uiRequired', function() {
            ctrl.$setValidity('required', !(attrs.uiRequired === 'true' && ctrl.$viewValue && ctrl.$viewValue.length === 0));
          });
        }
      };
    });


  angular
    .module('GPSCloud').filter('array2obj', function() {
    return function(arr, val) {
      var obj = {};
      for (var x in arr) {
   //     console.log("arr["+x+"]==="+arr[x].permission);
        obj[arr[x][val]] = arr[x];
      }

  //    console.log("obj==="+obj);
      return obj;
    }
  });

})();
