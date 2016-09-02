/**
 * Created by shuangshan on 16/1/21.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('AddUserController', AddUserController);

  /** @ngInject */
  function AddUserController($rootScope,$scope, $uibModal ,$uibModalInstance,treeFactory,USERINFO_URL,serviceResource, Notification,operatorInfo) {
    var vm = this;
    vm.operatorInfo =operatorInfo;
    //default user role for new added user


    //默认不接收位置异常报警
    vm.locationAlarmReceiverChk = false;

    vm.newUser = {};

    vm.ok = function (newUserinfo) {
      if (vm.locationAlarmReceiverChk){
        vm.newUser.locationAlarmReceiver = 1;
      }
      else{
        vm.newUser.locationAlarmReceiver = 0;
      }

      var restPromise = serviceResource.restAddRequest(USERINFO_URL,newUserinfo);
      restPromise.then(function (data){
        Notification.success("新建用户信息成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("新建用户信息出错!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.newUser.organizationDto=selectedItem;
      });
    }


  }
})();
