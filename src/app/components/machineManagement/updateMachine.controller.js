/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineController', updateMachineController);

  /** @ngInject */
  function updateMachineController($rootScope,$scope,$http,$uibModalInstance,DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL,serviceResource, Notification,machine) {
    var vm = this;
    vm.machine = machine;
    vm.operatorInfo =$rootScope.userInfo;


   // vm.deviceinfoList=[];

    //如果设备号不存在,则设置设备为空
    //if(vm.machine.deviceinfo==null){
    //  vm.machine.deviceinfo={deviceNum:""};
    //}

    if(null!=vm.machine.deviceinfo) {
      vm.oldMachine=vm.machine.deviceinfo;
    }

    //vm.deviceinfoList=[];
   // vm.deviceinfoList.push(vm.machine.deviceinfo);

    //动态查询未使用的本组织的设备
    vm.refreshDeviceList = function(value) {
      vm.deviceinfoList=[];
      if(value==""){
        return;
      }

      var params = {deviceNum: value};
      return $http.get(
        DEIVCIE_FETCH_UNUSED_URL,
        {params: params}
      ).then(function(response) {
        //vm.deviceinfoList = response.data
        vm.deviceinfoList=response.data;

        if(null!=vm.machine.deviceinfo)
        vm.deviceinfoList.push(vm.oldMachine);

      });
    };

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
      //if(null!=machine.deviceinfo) {
      //
      //
      //  machine.deviceinfo.machine = {};
      //
      //  if(null!=machine.deviceinfo.sim){
      //    machine.deviceinfo.sim.deviceinfo = {};
      //  }
      //
      //}


      //如果设备没有输入,则给出提示信息,
      //if(vm.machine.deviceinfo==null || vm.machine.deviceinfo.deviceNum==""){
      //  if(!confirm("设备号没有输入,请注意")){
      //    return;
      //  }
      //}

      var postInfo=machine;
      if (machine.deviceinfo){
        postInfo.deviceinfo={deviceNum:machine.deviceinfo.deviceNum};
      }
      else{
        postInfo.deviceinfo=null;
      }
      postInfo.org={id:machine.org.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_URL,postInfo);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success("修改车辆信息成功!");
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
  }
})();
