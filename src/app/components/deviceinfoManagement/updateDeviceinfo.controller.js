/**
 * Created by shuangshan on 16/1/20.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateDeviceinfoController', updateDeviceinfoController);

  /** @ngInject */
  function updateDeviceinfoController($rootScope, $scope,$http, $uibModalInstance, SIM_FETCH_UNUSED_URL, DEIVCIE_TYPE_LIST_URL, DEIVCIE_PROTOCAL_TYPE_LIST_URL, DEVCEINFO_URL, serviceResource, Notification, deviceinfo) {
    var vm = this;
    vm.deviceinfo = deviceinfo;
    vm.operatorInfo = $rootScope.userInfo;

    //查询sim卡的状态集合
    //var simData = serviceResource.restCallService(SIM_UNUSED_URL, "QUERY");
    //simData.then(function (data) {
    //  vm.simList = data;
    //}, function (reason) {
    //  Notification.error('获取Sim状态集合失败');
    //})
    //

    if(null!=vm.deviceinfo.sim) {
      vm.oldSim=vm.deviceinfo.sim;
    }

    vm.refreshSimList = function(value) {
      vm.simList=[];
      if(!onlyNumber(value)){
        return;
      }

      if(value.length!=4){
        //vm.errorMsg="请输入sim卡号后4位";
        return;
      }

      var params = {phoneNumber: value};
      return $http.get(
        SIM_FETCH_UNUSED_URL,
        {params: params}
      ).then(function(response) {

        vm.simList = response.data
        if(null!=vm.deviceinfo.sim)
          vm.simList.push(vm.oldSim);
      });
    };

    //得到设备类型集合
    var deviceTypeData = serviceResource.restCallService(DEIVCIE_TYPE_LIST_URL, "QUERY");
    deviceTypeData.then(function (data) {
      vm.deviceTypeList = data;
    }, function (reason) {
      Notification.error('获取设备类型失败');
    })

    //得到协议类型集合
    var protocalTypeData = serviceResource.restCallService(DEIVCIE_PROTOCAL_TYPE_LIST_URL, "QUERY");
    protocalTypeData.then(function (data) {
      vm.protocalTypeList = data;
    }, function (reason) {
      Notification.error('获取协议类型失败');
    })

    //日期控件相关
    //date picker
    vm.produceDateOpenStatus = {
      opened: false
    };


    vm.produceDateOpen = function ($event) {
      vm.produceDateOpenStatus.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    vm.changeProtocalType = function () {

      for (var i = 0; i < vm.protocalTypeList.length; i++) {
        //alert(vm.sim.simStatusList[i].desc);
        if (vm.protocalTypeList[i].value == vm.deviceinfo.protocalType) {
          //  alert(vm.sim.simStatusList[i].value);
          vm.protocalTypeDesc = vm.protocalTypeList[i].desc;
          break;
        }
      }


    }


    vm.ok = function (deviceinfo) {
      vm.errorMsg=null;
      vm.simNumber =null;
      if(deviceinfo.sim!=null && deviceinfo.sim.phoneNumber!=null){
        vm.simNumber = deviceinfo.sim.phoneNumber;
      }

      //重新构造需要传输的数据
      var operDeviceinfo={
        "id":deviceinfo.id,
        "deviceNum":deviceinfo.deviceNum,
        "protocalType":deviceinfo.protocalType,
        "produceDate":deviceinfo.produceDate,
        "simPhoneNumber": vm.simNumber,
        "orgId":deviceinfo.org.id
      };



      //TODO,为了解决提交报400错误,先人为把sim卡中包含的设备信息设为空 by riqian.ma 20160215
      if(deviceinfo.sim!=null){
        deviceinfo.sim.deviceinfo={};

        if(null!=deviceinfo.machine){
          deviceinfo.machine.deviceinfo={};
        }
      }





      var restPromise = serviceResource.restUpdateRequest(DEVCEINFO_URL, operDeviceinfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("修改设备信息成功!");

          $uibModalInstance.close(data.content);

        }else{
          Notification.error(data.message);
        }

      }, function (reason) {
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
    };


    vm.showOrgTree = false;
    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }
    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.deviceinfo.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
