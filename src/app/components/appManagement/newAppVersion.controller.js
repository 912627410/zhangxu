/**
 * Created by fxp on 9/25/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newAppVersionController', newAppVersionController);

  /** @ngInject */
  function newAppVersionController($rootScope,$uibModalInstance,serviceResource,APP_VERSION_URL, Notification) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;


    vm.appTypeList = [
      {icon: "fa fa-android", type: "android"},
      {icon: "fa fa-apple", type:"iphone"}
    ];

    vm.ifForcedList = [
      {value: 0, name: "否"},
      {value: 1, name: "是"}
    ];

    vm.appVersion = {
      releaseDate : new Date(),
      appType : "android",
      ifForced: '0'
    }

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
      var rspData = serviceResource.restAddRequest(APP_VERSION_URL,vm.appVersion);
      rspData.then(function (data) {
        Notification.success("新建APP VERSION成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
