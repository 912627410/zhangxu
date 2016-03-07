/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMachineController', newMachineController);

  /** @ngInject */
  function newMachineController($scope,$http, $uibModalInstance, DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.machine = {
      installTime:new Date(),
      buyTime:new Date()

    };
    //vm.machine.installTime=new Date();
   // vm.machine.buyTime=new Date();

    //查询未激活的设备集合
    //var deviceinfoData = serviceResource.restCallService(DEIVCIE_NOT_REGISTER_LIST_URL, "QUERY");
    //deviceinfoData.then(function (data) {
    //  vm.deviceinfoList = data;
    //}, function (reason) {
    //  Notification.error('获取Sim状态集合失败');
    //})


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
        vm.deviceinfoList = response.data

     //   alert( vm.deviceinfoList.length);
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

    //  alert(machine.deviceinfo.id);
      //如果设备没有输入,则给出提示信息,
      //if(vm.machine.deviceinfo.deviceNum==""){
      //  if(!confirm("设备号没有输入,请注意")){
      //    return;
      //  }
      //}

      //为了减少请求的参数,重新上设置参数
     // vm.machine.deviceinfoId=vm.machine.deviceinfo.id;
     // vm.machine.orgId=vm.machine.org.id;

    //  alert(vm.machine.deviceinfoId+"   "+vm.machine.orgId);
   //   alert(vm.machine.deviceinfo.deviceNum);

      var postInfo=machine;

      postInfo.deviceinfo={id:machine.deviceinfo.id};
      postInfo.org={id:machine.org.id};



    //  alert(postInfo.licenseId+"  "+postInfo.deviceNum+"  "+postInfo.orgId);

     var restPromise = serviceResource.restAddRequest(MACHINE_URL, postInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建车辆信息成功!");
          $uibModalInstance.close();
        }else{
          vm.machine = machine;
          Notification.error(data.message);
        }


      }, function (reason) {
       // alert(reason.data.message);
        console.error(reason);
        Notification.error(reason.data.message);
      }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
