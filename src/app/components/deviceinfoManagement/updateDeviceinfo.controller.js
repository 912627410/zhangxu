/**
 * Created by shuangshan on 16/1/20.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateDeviceinfoController', updateDeviceinfoController);

  /** @ngInject */
  function updateDeviceinfoController($rootScope, $scope, $uibModalInstance, SIM_UNUSED_URL, DEIVCIE_TYPE_LIST_URL, DEIVCIE_PROTOCAL_TYPE_LIST_URL, DEVCEINFO_URL, serviceResource, Notification, deviceinfo) {
    var vm = this;
    vm.deviceinfo = deviceinfo;
    vm.operatorInfo = $rootScope.userInfo;

    //查询sim卡的状态集合
    var simData = serviceResource.restCallService(SIM_UNUSED_URL, "QUERY");
    simData.then(function (data) {
      vm.simList = data;
    }, function (reason) {
      Notification.error('获取Sim状态集合失败');
    })


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
      Notification.error('获取设备类型失败');
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

      for (var i = 0; i < vm.sim.protocalTypeList.length; i++) {
        //alert(vm.sim.simStatusList[i].desc);
        if (vm.sim.protocalTypeList[i].value == vm.deviceinfo.protocalType) {
          //  alert(vm.sim.simStatusList[i].value);
          vm.sim.protocalTypeDesc = vm.deviceinfo.protocalTypeList[i].desc;
          break;
        }
      }


    }


    vm.ok = function (deviceinfo) {
      var restPromise = serviceResource.restUpdateRequest(DEVCEINFO_URL, deviceinfo);
      restPromise.then(function (data) {
        Notification.success("修改设备信息成功!");
        $uibModalInstance.close();
      }, function (reason) {
        Notification.error("修改设备信息出错!");
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
