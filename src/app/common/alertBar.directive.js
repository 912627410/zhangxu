/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .directive('alertBar', alertBar);

  /** @ngInject */
  function alertBar() {
    return {
      restrict: 'EA',
      templateUrl: 'app/main/alertBar.html',
      scope: {
        message: "=",
        type: "="
      },
      link: function (scope, element, attrs) {

        scope.hideAlert = function () {
          scope.message = null;
          scope.type = null;
        };

      }
    }
  }
})();
