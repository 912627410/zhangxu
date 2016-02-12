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

    vm.machine = {};

    //查询未激活的设备集合
    //var deviceinfoData = serviceResource.restCallService(DEIVCIE_NOT_REGISTER_LIST_URL, "QUERY");
    //deviceinfoData.then(function (data) {
    //  vm.deviceinfoList = data;
    //}, function (reason) {
    //  Notification.error('获取Sim状态集合失败');
    //})


    $scope.deviceinfoList = {};
    //$scope.refreshDeviceinfo = function(deviceNum) {
    //
    //  var url=DEIVCIE_NOT_REGISTER_LIST_URL;
    //  if(null!=deviceNum){
    //    url+="&deviceNum=deviceNum"
    //  }
    //  var deviceinfoData = serviceResource.restCallService(url, "QUERY");
    //  deviceinfoData.then(function (data) {
    //    vm.deviceinfoList = data;
    //  }, function (reason) {
    //    Notification.error('获取Sim状态集合失败');
    //  })
    //};




    //日期控件相关
    //date picker
    vm.installTimeOpenStatus = {
      opened: false
    };

    vm.installTimeOpen = function ($event) {
      vm.installTimeOpenStatus.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    vm.ok = function (machine) {
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
