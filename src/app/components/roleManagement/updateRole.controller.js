/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRoleController', updateRoleController);

  /** @ngInject */
  function updateRoleController($uibModalInstance,ROLE_URL,treeFactory,serviceResource,permissions, ROLE_TYPE_URL,Notification,roleInfo) {
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
        Notification.error('获取角色类型失败');
      })

    }

    vm.ok = function (roleInfo) {

      if(roleInfo.type==null){
        Notification.error('类型为空');
        return;
      }

      var restPromise = serviceResource.restUpdateRequest(ROLE_URL,roleInfo);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success("修改角色信息成功!");
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
