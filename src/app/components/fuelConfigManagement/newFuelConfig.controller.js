/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newFuelConfigController', newFuelConfigController);

  /** @ngInject */
  function newFuelConfigController($scope, $uibModalInstance, SIM_STATUS_URL, SIM_URL, simService, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.fuelConfig = {};

    //alert(simService.getSimStatusList());
    ////alert(simService.name);
    //
    var fuelTypePromise = machineService.getFuelTypeList();
    fuelTypePromise.then(function (data) {
      vm.fuelTypeList= data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取燃油类型失败');
    })

    vm.ok = function (sim) {
      var restPromise = serviceResource.restAddRequest(SIM_URL, sim);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建燃油类型成功!");
          $uibModalInstance.close();
        }else{
          Notification.error(data.message);
        }

      }, function (reason) {
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
