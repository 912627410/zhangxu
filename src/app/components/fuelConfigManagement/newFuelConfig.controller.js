/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newFuelConfigController', newFuelConfigController);

  /** @ngInject */
  function newFuelConfigController($rootScope,$scope, $uibModalInstance, fleetTreeFactory,fuelConfigService,FUEL_CONFIG_OPER_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;
    vm.fuelConfig = {};
    vm.fuelConfig.startDate=new Date();

    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    //alert(simService.getSimStatusList());
    ////alert(simService.name);
    //
    var fuelTypePromise = fuelConfigService.getFuelTypeList();
    fuelTypePromise.then(function (data) {
      vm.fuelTypeList= data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取燃油类型失败');
    });

    vm.ok = function (fuelConfig) {
      var restPromise = serviceResource.restAddRequest(FUEL_CONFIG_OPER_URL, fuelConfig);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建燃油类型成功!");
          $uibModalInstance.close(data.content);
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

    //组织树的显示
    vm.openTreeInfo= function() {
      fleetTreeFactory.treeShow(function (selectedItem) {
        vm.fuelConfig.orgEntity =selectedItem;
      });
    }



  }
})();
