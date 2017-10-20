/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRoleController', updateRoleController);

  /** @ngInject */
  function updateRoleController($uibModalInstance,ROLE_URL,languages,treeFactory,serviceResource,permissions, ROLE_TYPE_URL,Notification,roleInfo) {
    var vm = this;
    vm.roleInfo=roleInfo;

    // 初始化新建角色页面查询角色类型列表
    vm.init = function () {
      var promise = serviceResource.restCallService(ROLE_TYPE_URL, "QUERY");
      promise.then(function (data) {
        vm.roleTypeList = data;

        // 非系统管理员不能新建系统角色
        if(!permissions.getPermissions("system:sysRole:create")){
          _.remove(vm.roleTypeList, function (type) {
            return type.value  == 0;
          })
        }

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetTheRoleType'));
      })

    }

    vm.ok = function (roleInfo) {

      if(roleInfo.type==null){
        Notification.error(languages.findKey('theTypeIsEmpty'));
        return;
      }

      var restPromise = serviceResource.restUpdateRequest(ROLE_URL,roleInfo);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success(languages.findKey('successfullyModifiedRoleInfo'));
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

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.roleInfo.organizationDto=selectedItem;
      });
    }

    vm.init();
  }
})();
