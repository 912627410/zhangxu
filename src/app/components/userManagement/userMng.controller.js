/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('userMngController', userMngController);

  /** @ngInject */
  function userMngController($rootScope,$confirm,$uibModal,Notification,commonFactory,serviceResource, $http,USER_ROLE_URL,
                             USER_PAGE_URL,USER_STATUS_DISABLE_URL,USER_STATUS_ENABLE_URL,USER_PRIV_EXPORT_URL ) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = angular.copy([$rootScope.orgChart[0]]);
    } else {
      Notification.error('获取组织机构信息失败');
    }

    // select org
    vm.my_tree_handler = function (branch) {

      var restCallURL = USER_PAGE_URL;
      var pageUrl = 0;
      var sizeUrl = 10000;
      var sortUrl = "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if (null != branch && null != branch.id) {
        restCallURL += "&search_EQ_organization.id=" + branch.id;
      }

      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.userinfoList = data.content;

      }, function (reason) {
        Notification.error("获取角色数据失败");
      });

    }

    // select user
    vm.roleTreeOptions = {
      nodeChildren: "privileges"
    }

    vm.selectUser = function (user) {

      vm.selectedUser = user;

      var roleUserUrl = USER_ROLE_URL;
      roleUserUrl += "?userinfoId=" + user.id;
      //得到角色用户信息
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "GET");
      roleUserPromise.then(function (data) {

        vm.roleList = commonFactory.unflatten(data.content);

      })

    }


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

      var singlUrl = USERINFO_URL + "?id=" + usermnginfo.id;
      var userfoPromis = serviceResource.restCallService(singlUrl, "GET");
      userfoPromis.then(function (data) {
        var operusermnginfo = data.content;
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/userManagement/updateUserInfo.html',
          controller: 'updateUserinfoController as updateUserinfoCtrl',
          size: size,
          backdrop: false,
          resolve: {
            usermnginfo: function () {
              return operusermnginfo;
            }
          }
        });

        modalInstance.result.then(function(result) {

          var tabList=vm.tableParams.data;
          //更新内容
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.id){
              tabList[i]=result;
            }
          }

        }, function(reason) {

        });


      }, function (reason) {
        Notification.error('获取用户信息失败');
      });
    };


    vm.query = function (page, size, sort, userinfo) {

      //构造查询条件
      var restCallURL = USER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 10000;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != userinfo) {
        if (null != userinfo.ssn && userinfo.ssn != "") {
          restCallURL += "&search_LIKE_ssn=" + userinfo.ssn;
        }

        if (null != userinfo.firstname) {
          restCallURL += "&search_LIKE_firstname=" + userinfo.firstname;
        }

      }

      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.userinfoList = data.content;

      }, function (reason) {
        Notification.error("获取用户数据失败");
      });
    }


    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.userinfo = null;
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
      for(var i=0;i<vm.userinfoList.length;i++){
        if(vm.userinfoList[i].id==content.id){
          vm.userinfoList[i]=content;
        }
      }
    }


    /**
     * user角色管理
     * @param size
     */
    vm.userRoleManage = function (size) {

      if(vm.selectedUser==null){
        Notification.warning("请先选择用户再进行操作");
        return;
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/userRoleMng.html',
        controller: 'userRoleMngController as userRoleMngController',
        size: size,
        backdrop: false,
        resolve: {
          userinfo: function () {
            return vm.selectedUser;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.selectUser(vm.selectedUser);

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

      }, function () {
        //取消
      });
    };
    //


    vm.privExport = function () {

      if (vm.selected.length > 0) {
        var restCallURL = USER_PRIV_EXPORT_URL + "?userList=" + vm.selected;

        $http({
          url: restCallURL,
          method: "GET",
          responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {
          if(status == '204'){

            Notification.warning('选择的用户角色权限列表为空');
            return;
          }
          var blob = new Blob([data], { type: "application/vnd.ms-excel" });
          var objectUrl = window.URL.createObjectURL(blob);

          var anchor = angular.element('<a/>');
          anchor.attr({
            href: objectUrl,
            target: '_blank',
            download: '用户权限.xls'
          })[0].click();

        }).error(function (data, status, headers, config) {
          Notification.error("导出失败!");
        });
      }else {
        Notification.warning({message: '请选择要导出的用户', positionY: 'top', positionX: 'center'});
      }

    }

    //首次查询
    vm.query(null, null, null, null);
  }
})();
