/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMachineController', newMachineController);

  /** @ngInject */
  function newMachineController($scope, $uibModalInstance, DEIVCIE_NOT_REGISTER_LIST_URL,MACHINE_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.machine = {deviceinfo:{deviceNum:""}};
    vm.machine.installTime=new Date();
    vm.machine.buyTime=new Date();

    //查询未激活的设备集合
    //var deviceinfoData = serviceResource.restCallService(DEIVCIE_NOT_REGISTER_LIST_URL, "QUERY");
    //deviceinfoData.then(function (data) {
    //  vm.deviceinfoList = data;
    //}, function (reason) {
    //  Notification.error('获取Sim状态集合失败');
    //})



    //日期控件相关
    //date picker
    vm.installTimeOpenStatus = {
      opened: false
    };

    vm.installTimeOpen = function ($event) {
      vm.installTimeOpenStatus.opened = true;
    };

    vm.buyTimeOpenStatus = {
      opened: false
    };

    vm.buyTimeOpen = function ($event) {
      vm.buyTimeOpenStatus.opened = true;
    };


    vm.showOrgTree = false;
    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }
    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.machine.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })


    vm.ok = function (machine) {

      //如果设备没有输入,则给出提示信息,
      if(vm.machine.deviceinfo.deviceNum==""){
        if(!confirm("设备号没有输入,请注意")){
          return;
        }
      }

     var restPromise = serviceResource.restAddRequest(MACHINE_URL, machine);
      restPromise.then(function (data) {
        Notification.success("新建车辆信息成功!");
        $uibModalInstance.close();
      }, function (reason) {
        Notification.error("新建车辆信息出错!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
