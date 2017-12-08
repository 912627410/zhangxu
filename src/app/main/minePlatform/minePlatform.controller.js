/**
 * Created by yalong on 17-12-8.
 */
(function () {

  angular
    .module('GPSCloud')
    .controller('minePlatformController', minePlatformController);

  /** @ngInject */
  function minePlatformController($rootScope, $cookies, $scope, $translate, $state, languages) {
    var vm = this;
    var userInfo = $rootScope.userInfo;

    $rootScope.$state.go('mine');



  }

})();
