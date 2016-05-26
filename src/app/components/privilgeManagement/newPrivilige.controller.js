/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newPrivilgeController', newPrivilgeController);

  /** @ngInject */
  function newPrivilgeController($scope, $uibModalInstance,PRIVILAGE_OPER_URL, serviceResource, Notification) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;

    vm.privilgeInfo = {};


    vm.ok = function (privilgeInfo) {
     var restPromise = serviceResource.restAddRequest(PRIVILAGE_OPER_URL, privilgeInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建权限信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          vm.privilgeInfo = privilgeInfo;
          Notification.error(data.message);
        }
      }, function (reason) {
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
      }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
