/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('personnelInfoMngController', personnelInfoMngController);

  /** @ngInject */
  function personnelInfoMngController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    vm.data = "123";

    vm.query = function (data) {
      console.log(data);
    }


  }
})();
