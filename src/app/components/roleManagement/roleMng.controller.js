(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('roleMngController', roleMngController);

  /** @ngInject */
  function roleMngController($rootScope, $uibModal, NgTableParams, ngTableDefaults, Notification, serviceResource,roleService, DEFAULT_SIZE_PER_PAGE, ROLE_PAGE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.orgTypeList;

    //初始化查询参数
    vm.roleInfo = {
      "name": ""
    };


    var promise = roleService.queryOrgTypeList();
    promise.then(function (data) {
      vm.orgTypeList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取组织类型失败');
    })

    /**
     * 分页查询
     * @param page
     * @param size
     * @param sort
       * @param roleInfo
       */
    vm.query = function (page, size, sort, roleInfo) {
      //构造查询条件
      var restCallURL = ROLE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != roleInfo) {
        if (null != roleInfo.name && roleInfo.name != "") {
          restCallURL += "&search_LIKE_name=" + roleInfo.name;
        }

      }
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.tableParams = new NgTableParams({},
          {
            dataset: data.content
          });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取角色数据失败");
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


    /**
     * 新建角色
     * @param size
       */
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
       // console.log(result);
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
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
            return roleInfo;
          }
        }
      });

      modalInstance.result.then(function(result) {
        for(var i=0;i<vm.tableParams.data.length;i++){
          if(vm.tableParams.data[i].id==result.id){
            vm.tableParams.data[i]=result;
          }
        }


      }, function(reason) {
        for(var i=0;i<vm.tableParams.data.length;i++){
          if(vm.tableParams.data[i].id==sourceRoleInfo.id){
            vm.tableParams.data[i]=sourceRoleInfo;
          }
        }
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
        // console.log(result);
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };
 /**
     * 包含用户管理
     * @param size
     */
    vm.rolePriviligeManage = function (roleInfo,size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/roleManagement/rolePriviligeMng.html',
        controller: 'rolePriviligeMngController as rolePriviligeMngController',
        size: size,
        backdrop: false,
        resolve: {
          roleInfo: function () {
            return roleInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

  }
})();
