/**
 * Created by yalong on 17-12-8.
 */
(function () {

  angular
    .module('GPSCloud')
    .controller('minemngController', minemngController);

  /** @ngInject */
  function minemngController($rootScope, $cookies, $scope, $translate, $state, languages) {
    var vm = this;
    var userInfo = $rootScope.userInfo;

    $rootScope.$state.go('minemng');



  }

})();
