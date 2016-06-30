/**
 * Created by lqh on 16-6-25.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newSysconfigController', newSysconfigController);

  /** @ngInject */
  function newSysconfigController($rootScope,$scope,$http, $uibModal,$uibModalInstance,treeFactory, DEIVCIE_FETCH_UNUSED_URL,SYS_CONFIG_URL,ENGINE_TYPE_LIST_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.sysconfig = {
      installTime:new Date(),
      buyTime:new Date()

    };

    vm.ok = function (sysconfig) {

      var postInfo=sysconfig;

      var restPromise = serviceResource.restAddRequest(SYS_CONFIG_URL, postInfo);
      restPromise.then(function (data) {

          if(data.code===0){
            Notification.success("新建系统参数成功!");
            $uibModalInstance.close(data.content);

          }else{
            vm.sysconfig = sysconfig;
            Notification.error(data.message);
          }
        }, function (reason) {
          // alert(reason.data.message);
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

