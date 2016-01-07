(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $state, $stateParams, $window,$log) {


    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    if ($window.sessionStorage["userInfo"]) {
      $rootScope.userInfo = JSON.parse($window.sessionStorage["userInfo"]);
    }
    if ($window.sessionStorage["statisticInfo"]) {
      $rootScope.statisticInfo = JSON.parse($window.sessionStorage["statisticInfo"]);
    }
    $log.debug('runBlock end');

  }

})();
