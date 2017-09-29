/**
 * Created by fxp on 9/25/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateAppVersionController', updateAppVersionController);

  /** @ngInject */
  function updateAppVersionController($rootScope,$uibModalInstance,serviceResource,APP_VERSION_URL, Notification,appVersion) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;

    vm.appVersion = angular.copy(appVersion) ;
    vm.appTypeList = [
      {icon: "fa fa-android", type: "android"},
      {icon: "fa fa-apple", type:"iphone"}
    ];

    vm.ifForcedList = [
      {value: 0, name: "否"},
      {value: 1, name: "是"}
    ];

    // 日期控件相关
    // date picker
    vm.releaseDateOpenStatus = {
      opened: false
    };

    vm.releaseDateOpen = function ($event) {
      vm.releaseDateOpenStatus.opened = true;
    };


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.ok = function () {
      var rspData = serviceResource.restUpdateRequest(APP_VERSION_URL,vm.appVersion);
      rspData.then(function (data) {
        Notification.success("修改APP VERSION成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
