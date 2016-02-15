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

    //alert(simService.getSimStatusList());
    ////alert(simService.name);
    //
    //查询sim卡的状态集合
    var simStatusData = serviceResource.restCallService(SIM_STATUS_URL, "QUERY");
    simStatusData.then(function (data) {
      vm.sim.simStatusList = data;
    }, function (reason) {
      Notification.error('获取SIM卡状态集合失败');
    })

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
        Notification.success("新建SIM卡信息成功!");
        $uibModalInstance.close();
     //   alert($scope.radioListType);
      }, function (reason) {
        Notification.error("新建SIM卡信息出错!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
