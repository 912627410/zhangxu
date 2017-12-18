(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalUserRoleMngController', rentalUserRoleMngController);

  /** @ngInject */
  function rentalUserRoleMngController($rootScope,  $uibModalInstance,languages,  Notification, serviceResource, USER_ROLE_URL, ROLE_URL, userinfo) {
    var vm = this;
    vm.selected = [];
    vm.userinfo = userinfo;

    vm.querySysRole = function () {
      var roleUrl = ROLE_URL + "?search_EQ_type=0";
      var rolePromise = serviceResource.restCallService(roleUrl, "GET");
      rolePromise.then(function (data) {
        vm.sysRoleList = data.content;
      })
    }

    vm.queryUserRole = function (user){
      //查询用户角色列表
      var roleUserUrl = USER_ROLE_URL;
      roleUserUrl += "?userinfoId=" + user.id;
      //得到角色用户信息
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "GET");
      roleUserPromise.then(function (data) {

        vm.userRoleList = data.content;
        for(var j=0;j < vm.userRoleList.length; j++){
          vm.selected.push(vm.userRoleList[j].id);
        }
      })

    }

    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = angular.copy([$rootScope.orgChart[0]]);
      vm.queryUserRole(vm.userinfo);
      vm.querySysRole();
    } else {
      Notification.error(languages.findKey('failedToGetOrganizationInformation'));
    }

    // select org
    vm.my_tree_handler = function (branch) {

      var restCallURL = ROLE_URL;
      if (null != branch && null != branch.id) {
        restCallURL += "?search_EQ_organization.id=" + branch.id;
      }

      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.roleList = data.content;

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetRoleData'));
      });

    }

    //关闭
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.isSelected = function (roleId) {
      return vm.selected.indexOf(roleId) >= 0;
    }

    // single select
    vm.updateSelection = function ($event, roleId, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, roleId);
    }

    var updateSelected = function (action, roleId) {
      if (action == 'add' && vm.selected.indexOf(roleId) == -1) {
        vm.selected.push(roleId);
      }
      if (action == 'remove' && vm.selected.indexOf(roleId) != -1) {
        var idx = vm.selected.indexOf(roleId);
        vm.selected.splice(idx, 1);
      }
    }


    // submit
    vm.ok = function () {

      var rspUrl = USER_ROLE_URL;
      rspUrl +="?userinfoId=" + vm.userinfo.id + "&roleIdList=" + vm.selected;
      var promise = serviceResource.restCallService(rspUrl, "UPDATE");
      promise.then(function (data) {

        if(data.code ==0){
          Notification.success(languages.findKey('successfullyModifiedUserRole'));
          $uibModalInstance.close(data.content);
        }

      }, function (reason) {
        Notification.error(languages.findKey('modificationFailed'));
      });
    }

  }
})();
