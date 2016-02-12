/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newSimController', newSimController);

  /** @ngInject */
  function newSimController($scope, $uibModalInstance, SIM_STATUS_URL, SIM_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.sim = {};

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

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.ok = function (sim) {
      var restPromise = serviceResource.restAddRequest(SIM_URL, sim);
      restPromise.then(function (data) {
        Notification.success("新建SIM卡信息成功!");
        $uibModalInstance.close();
      }, function (reason) {
        Notification.error("新建SIM卡信息出错!");
      });
    };

    vm.showOrgTree = false;

    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.sim.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
