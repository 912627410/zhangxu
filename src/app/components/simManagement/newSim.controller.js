/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newSimController', newSimController);

  /** @ngInject */
  function newSimController($scope, $uibModalInstance, SIM_STATUS_URL, SIM_URL, simService, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.sim = {};

    //日期控件相关
    //date picker
    vm.serviceBeginDateOpenStatus = {
      opened: false
    };
    vm.serviceEndDateOpenStatus = {
      opened: false
    };

    vm.serviceBeginDateOpen = function ($event) {
      vm.serviceBeginDateOpenStatus.opened = true;
    };
    vm.serviceEndDateOpen = function ($event) {
      vm.serviceEndDateOpenStatus.opened = true;
    };
    //vm.a={opened:""};
    //var d=simService.dateOption(vm.a, vm.b);
    //alert(vm.a.opened);

    //设置日期的默认值
    vm.sim.serviceBeginDate=new Date();
    vm.sim.serviceEndDate=new Date("2099-01-01");

    vm.ok = function (sim) {
      var restPromise = serviceResource.restAddRequest(SIM_URL, sim);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建SIM卡信息成功!");
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
