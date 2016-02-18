/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineController', updateMachineController);

  /** @ngInject */
  function updateMachineController($rootScope,$scope,$uibModalInstance,MACHINE_URL,serviceResource, Notification,machine) {
    var vm = this;
    vm.machine = machine;
    vm.operatorInfo =$rootScope.userInfo;


    //如果设备号不存在,则设置设备为空
    if(vm.machine.deviceinfo==null){
      vm.machine.deviceinfo={deviceNum:""};
    }

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
      //TODO,为了解决提交报400错误,先人为把sim卡中包含的设备信息设为空 by riqian.ma 20160215
      machine.deviceinfo.sim.deviceinfo={};
      machine.deviceinfo.machine={};


      //如果设备没有输入,则给出提示信息,
      if(vm.machine.deviceinfo.deviceNum==""){
        if(!confirm("设备号没有输入,请注意")){
          return;
        }
      }

      var restPromise = serviceResource.restUpdateRequest(MACHINE_URL,machine);
      restPromise.then(function (data){
        Notification.success("修改车辆信息成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改车辆信息出错!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
