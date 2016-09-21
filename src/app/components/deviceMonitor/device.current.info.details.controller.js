/**
 * Created by yalong on 16/9/20.
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
