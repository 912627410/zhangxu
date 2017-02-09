/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('userMngController', userMngController);

  /** @ngInject */
  function userMngController($rootScope,$scope,$confirm,$uibModal,Notification,treeFactory,NgTableParams,ngTableDefaults,serviceResource,
                             USERINFO_URL,userService,
                             DEFAULT_SIZE_PER_PAGE,USER_PAGE_URL,USER_STATUS_DISABLE_URL,USER_STATUS_ENABLE_URL ) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    vm.userinfoStatusList;
    vm.org = {label: ""};
    vm.orgs = {label: ""};

    var promise = userService.queryStatusList();
    promise.then(function (data) {
      vm.userinfoStatusList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取权限状态失败');
    })

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function(selectedItem){
        vm.org =selectedItem;
      });
    }

    vm.animationsEnabled = true;
    vm.toggleAnimation = function () {
      vm.animationsEnabled = !vm.animationsEnabled;
    };

//new user
    vm.addUser = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/newUser.html',
        controller: 'AddUserController as addUserCtrl',
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

//change password
    vm.updatePassword = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/updatePassword.html',
        controller: 'updatePasswordController as updatePasswordCtrl',
        size: size,
        backdrop: false,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };


//update userinfo
    vm.updateUserInfo = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/updateUserInfo.html',
        controller: 'updateUserinfoController as updateUserinfoCtrl',
        size: size,
        backdrop: false,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {

      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    vm.query = function (page, size, sort, userinfo) {

      //console.log(vm.checked);
      vm.checked = false; //每次查询,全选默认为false

      // console.log(vm.checked);
      vm.selected = []; //选中的设备id为空
      //构造查询条件
      var restCallURL = USER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != userinfo) {
        if (null != userinfo.ssn && userinfo.ssn != "") {
          restCallURL += "&search_LIKE_ssn=" + userinfo.ssn;
        }

        if (null != userinfo.status) {
          restCallURL += "&search_EQ_status=" + userinfo.status.value;
        }

      }

      if (null != vm.org && null != vm.org.id) {
        restCallURL += "&search_EQ_organization.id=" + vm.org.id;
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
    vm.query(null, null, null, null);

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.userinfo = null;
      vm.org = null;
    }

    vm.statusDisable = function (userinfo) {
      $confirm({text: '确定要禁用吗?',title: '禁用确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(USER_STATUS_DISABLE_URL, userinfo.id);
          restPromise.then(function (data) {
            Notification.success("禁用成功!");
            vm.updateTable(data.content);

          }, function (reason) {
            Notification.error("禁用出错!");
          });
        });
    };

    vm.statusEnable = function (userinfo) {
      $confirm({text: '确定要启用吗?',title: '启用确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(USER_STATUS_ENABLE_URL, userinfo.id);
          restPromise.then(function (data) {
            Notification.success("启用成功!");
            vm.updateTable(data.content);
          }, function (reason) {
            Notification.error("启用出错!");
          });
        });
    };

    vm.updateTable=function(content){
      for(var i=0;i<vm.tableParams.data.length;i++){
        if(vm.tableParams.data[i].id==content.id){
          vm.tableParams.data[i]=content;
        }
      }
    }


    /**
     * 隶属角色管理
     * @param size
     */
    vm.userRoleManage = function (userinfo,size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/userRoleMng.html',
        controller: 'userRoleMngController as userRoleMngController',
        size: size,
        backdrop: false,
        resolve: {
          userinfo: function () {
            return userinfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        // console.log(result);
//        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    /**
     * 操作日志查询
     * @param size
     */
    vm.logQuery = function (userinfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/operationLog.html',
        controller: 'operationLogController as operationLogCtrl',
        size: size,
        backdrop: false,
        resolve: {
          userinfo: function () {
            return userinfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        // console.log(result);
//        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };
  }
})();
