/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRoleController', newRoleController);

  /** @ngInject */
  function newRoleController($scope, $uibModalInstance,ROLE_URL,treeFactory, serviceResource,ROLE_TYPE_URL, Notification,permissions) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;

    vm.roleInfo = {type:1};
    //默认自定义角色

    // 初始化新建角色页面查询角色类型列表
    vm.init = function () {
      var promise = serviceResource.restCallService(ROLE_TYPE_URL, "QUERY");
      promise.then(function (data) {
        vm.roleTypeList = data;

        // 非系统管理员不能新建系统角色
        if(!permissions.getPermissions("sys:role:sysRole")){
          _.remove(vm.roleTypeList, function (type) {
            return type.value  == 0;
          })
        }
        // // 默认添加自定义角色
        // vm.roleInfo.type = _.find(vm.roleTypeList, function (type) {
        //   return type.value  == 1;
        // })

      }, function (reason) {
        Notification.error('获取组织类型失败');
      })

    }

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.roleInfo.organizationDto=selectedItem;
      });
    }

    //提交
    vm.ok = function (roleInfo) {
     var restPromise = serviceResource.restAddRequest(ROLE_URL, roleInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建角色信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          vm.roleInfo = roleInfo;
          Notification.error(data.message);
        }
      }, function (reason) {
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.init();
  }
})();
