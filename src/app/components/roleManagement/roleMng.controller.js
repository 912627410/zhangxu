(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('roleMngController', roleMngController);

  /** @ngInject */
  function roleMngController($rootScope, languages,$uibModal, ROLE_MENU_LIST_URL, Notification, serviceResource,commonFactory, ROLE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = angular.copy([$rootScope.orgChart[0]]);
    } else {
      Notification.error(languages.findKey('failedToGetOrganizationInformation'));
    }

    //点击组织查询包含角色
    vm.my_tree_handler = function (orgId) {

      var restCallURL = ROLE_URL;
      if (null != orgId ) {
        restCallURL += "?search_EQ_organization.id=" + orgId;
      }

      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {
        vm.roleList = data.content;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetRoleData'));
      });

    }

    //点击角色查询包含权限
    vm.selectRole = function (role) {

      vm.selectedRole = role;

      var restUrl = ROLE_MENU_LIST_URL;
      restUrl += "?roleId=" + role.id;
      //得到角色Menu信息
      var roleUserPromise = serviceResource.restCallService(restUrl, "GET");
      roleUserPromise.then(function (data) {


        var menuList = commonFactory.unflatten(data.content);

        // 将权限项放到child里
        commonFactory.recursiveChild(menuList, "privileges");

        vm.menuList = menuList;

      })

    }

    //查询
    vm.query = function (roleInfo) {
      //构造查询条件
      var restCallURL = ROLE_URL;
      if (null != roleInfo) {
        if (null != roleInfo.name && roleInfo.name != "") {
          restCallURL += "?search_LIKE_name=" + roleInfo.name;
        }
      }
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {
        vm.roleList = data.content;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetRoleData'));
      });
    }

    //首次查询
    vm.query();

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.roleInfo = null;
    }


    //新建角色
    vm.newRole = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/roleManagement/newRole.html',
        controller: 'newRoleController as newRoleController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.my_tree_handler(result.organizationDto.id)
      }, function () {
      });
    };

    //更新角色
    vm.updateRole = function (roleInfo, size) {

      var sourceRoleInfo = angular.copy(roleInfo); //深度copy
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/roleManagement/updateRole.html',
        controller: 'updateRoleController as updateRoleController',
        size: size,
        backdrop: false,
        resolve: {
          roleInfo: function () {
            return angular.copy(roleInfo);
          }
        }
      });

      modalInstance.result.then(function(result) {
        for(var i=0;i<vm.roleList.length;i++){
          if(vm.roleList[i].id==result.id){
            vm.roleList[i]= result;
          }
        }

      }, function(reason) {

      });
    };


    /**
     * 包含用户管理
     * @param size
     */
    vm.roleUserManage = function (roleInfo,size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/roleManagement/roleUserMng.html',
        controller: 'roleUserMngController as roleUserMngController',
        size: size,
        backdrop: false,
        resolve: {
          roleInfo: function () {
            return roleInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {

      }, function () {
        //取消
      });
    };
    /**
     * 包含权限管理
     * @param size
     */
    vm.rolePrivilegeManage = function (roleInfo,size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/roleManagement/rolePrivilegeMng.html',
        controller: 'rolePrivilegeMngController as rolePrivilegeMngController',
        size: size,
        backdrop: false,
        resolve: {
          roleInfo: function () {
            return roleInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {

        vm.selectRole(roleInfo);
      }, function () {
        //取消
      });
    };

  }
})();
