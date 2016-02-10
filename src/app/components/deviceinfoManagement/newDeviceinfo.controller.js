/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newDeviceinfoController', newDeviceinfoController);

  /** @ngInject */
  function newDeviceinfoController($scope, $uibModalInstance, SIM_UNUSED_URL, DEIVCIE_TYPE_LIST_URL, DEIVCIE_PROTOCAL_TYPE_LIST_URL,DEVCEINFO_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.deviceinfo = {};

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

    vm.ok = function (deiceinfo) {
      var restPromise = serviceResource.restAddRequest(DEVCEINFO_URL, deiceinfo);
      restPromise.then(function (data) {
        Notification.success("新建设备信息成功!");
        $uibModalInstance.close();

      //  $scope.query(0,10,null,null);//更新列表展示
      }, function (reason) {
        Notification.error("新建设备信息出错!");
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
