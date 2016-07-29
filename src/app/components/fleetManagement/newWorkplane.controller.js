/**
 * Created by develop on 7/21/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newWorkplaneController', newWorkplaneController);

  /** @ngInject */
  function newWorkplaneController($rootScope,$scope,$http,$confirm,$uibModalInstance,WORKPLANE_URL,serviceResource, Notification) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;

    serviceResource.refreshMapWithDeviceInfo("workplaneMap",null,8,null);

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.ok = function (workplane) {

      var rspdata = serviceResource.restAddRequest(WORKPLANE_URL,workplane);
      rspdata.then(function (data) {
        if(data.code===0){
          Notification.success("新建作业面成功!");
          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }

      },function (reason) {
        vm.errorMsg = reason.data.message;
        Notification.error(reason.data.message);
      })
    }

  }
})();
