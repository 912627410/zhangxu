/**
 * Created by shuangshan on 16/1/20.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('activeDeviceinfoController', activeDeviceinfoController);

  /** @ngInject */
  function activeDeviceinfoController($rootScope, $scope, $uibModalInstance, DEIVCIE_UNLOCK_FACTOR_URL, serviceResource, Notification, deviceinfo) {
    var vm = this;
    vm.deviceinfo = deviceinfo;
    vm.operatorInfo = $rootScope.userInfo;

    var restURL = DEIVCIE_UNLOCK_FACTOR_URL + "?deviceNum=" + vm.deviceinfo.deviceNum;

    var rspData = serviceResource.restCallService(restURL, "GET");
    rspData.then(function (data) {
      vm.deviceUnLockFactor = data.content;
      //具体格式请参考短信激活文档
      vm.activeMsg = "23AA070A010001" + vm.deviceUnLockFactor.deviceNum + "01"+ vm.deviceUnLockFactor.identityId + vm.deviceUnLockFactor.enginePassCode +"FFFF2A";
      vm.unActiveMsg = "23AA070A010001" + vm.deviceUnLockFactor.deviceNum + "10"+ vm.deviceUnLockFactor.identityId + vm.deviceUnLockFactor.enginePassCode +"FFFF2A";
    }, function (reason) {
      Notification.error('获取信息失败');
    })


    vm.ok = function (deviceinfo) {

    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
