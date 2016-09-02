/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateFuelConfigController', updateFuelConfigController);

  /** @ngInject */
  function updateFuelConfigController($rootScope,$scope,$uibModalInstance,$timeout,treeFactory,FUEL_CONFIG_OPER_URL,fuelConfigService,serviceResource, Notification,fuelConfig) {
    var vm = this;
    vm.fuelConfig = fuelConfig;
    vm.operatorInfo =$scope.userInfo;

    var fuelTypePromise = fuelConfigService.getFuelTypeList();
    fuelTypePromise.then(function (data) {
      vm.fuelTypeList= data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取燃油类型失败');
    })



    vm.ok = function (fuelConfig) {
      var restPromise = serviceResource.restUpdateRequest(FUEL_CONFIG_OPER_URL,fuelConfig);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success("修改燃油配置信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });

    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.fuelConfig.orgEntity=selectedItem;
      });
    }

  }
})();
