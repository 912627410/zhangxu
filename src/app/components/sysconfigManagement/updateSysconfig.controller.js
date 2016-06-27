/**
 * Created by lqh on 16-6-24.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateSysconfigController', updateSysconfigController);

  /** @ngInject */
  function updateSysconfigController($rootScope,$scope,$http,$confirm,$uibModalInstance,DEIVCIE_FETCH_UNUSED_URL,SYS_CONFIG_URL,ENGINE_TYPE_LIST_URL,serviceResource, Notification,sysconfig) {
    var vm = this;
    vm.sysconfig = sysconfig;
    vm.operatorInfo =$rootScope.userInfo;



    vm.ok = function (sysconfig) {

      var postInfo=sysconfig;

      var restPromise = serviceResource.restUpdateRequest(SYS_CONFIG_URL,postInfo);
      restPromise.then(function (data){

        if(data.code===0){

            Notification.success("修改系统参数成功!");

          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
    };



    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
