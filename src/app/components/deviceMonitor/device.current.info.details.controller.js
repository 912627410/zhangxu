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
    vm.timezone='new Date(2017,1,1).toString().match(/\+[0-9]+|\-[0-9]+/)';
    vm.deviceinfo = deviceinfo;


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
