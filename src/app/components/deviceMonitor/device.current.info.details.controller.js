/**
 * Created by shuangshan on 16/1/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceCurrentInfoDetailsController', DeviceCurrentInfoDetailsController);

  /** @ngInject */
  function DeviceCurrentInfoDetailsController($uibModalInstance,permissions,deviceinfo) {
    var vm = this;
    vm.deviceinfo = deviceinfo;

    vm.validateMonitorShowPermission=function(){
      return permissions.getPermissions("device:monitorShow");
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
