/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMachineController', newMachineController);

  /** @ngInject */
  function newMachineController($scope,$http, $uibModalInstance, DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL,ENGINE_TYPE_LIST_URL, serviceResource, Notification, operatorInfo) {
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

    //得到发动机类型集合
    var engineTypeData = serviceResource.restCallService(ENGINE_TYPE_LIST_URL, "QUERY");
    engineTypeData.then(function (data) {
      vm.engineTypeList = data;
    }, function (reason) {
      Notification.error('获取发动机类型失败');
    })


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
      if (machine.deviceinfo){
        //条码输入
        if (machine.deviceinfo.deviceNum.length == 26 && vm.deviceNumFromScanner == true && vm.deviceNumContentFromScanner != null & vm.deviceNumContentFromScanner !='') {
          machine.deviceinfo.deviceNum = vm.deviceNumContentFromScanner;
        }
        postInfo.deviceinfo={deviceNum:machine.deviceinfo.deviceNum};
      }
      else{
        postInfo.deviceinfo=null;
      }
      postInfo.org={id:machine.org.id};
      postInfo.engineType={id:machine.engineType};

     var restPromise = serviceResource.restAddRequest(MACHINE_URL, postInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建车辆信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          vm.machine = machine;
          Notification.error(data.message);
        }
      }, function (reason) {
       // alert(reason.data.message);
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
      }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //默认不是通过扫码输入
    vm.deviceNumFromScanner = false;
    vm.deviceNumContentFromScanner = '';
    //用于判断设备号输入的数据是否是通过扫码输入
    //扫码格式是 ".LG4130002690.43985.C202B5"
    vm.deviceNumInputChanged = function(deviceNum){
      if (deviceNum.length == 26){
        if (deviceNum.substring(0,1) == '.' && deviceNum.substring(13,14) == '.' && deviceNum.substring(19,20) == '.'){
          vm.deviceNumFromScanner = true;
          vm.deviceNumContentFromScanner = deviceNum.substring(20);
        }
        else{
          vm.deviceNumFromScanner = false;
          vm.deviceNumContentFromScanner = '';
        }
      }
      else{
        vm.deviceNumFromScanner = false;
        vm.deviceNumContentFromScanner = '';
      }
    }


  }
})();
