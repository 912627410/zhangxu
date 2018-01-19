/**
 * Created by mengwei on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalUserMngController', rentalUserMngController);

  /** @ngInject */
  function rentalUserMngController($rootScope,$confirm,$uibModal,Notification,commonFactory,serviceResource, $http,languages,RENTAL_USER_ROLE_URL,
                             USER_PAGE_URL,USER_STATUS_DISABLE_URL,USER_STATUS_ENABLE_URL,USER_PRIV_EXPORT_URL,USERINFO_URL,ROLE_MENU_LIST_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.currentOrgId = $rootScope.userInfo.userdto.organizationDto.id;

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
      vm.currentOrgId = branch.id;
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {
        vm.userinfoList = data.content;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetRoleData'));
      });

    }

    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = angular.copy([$rootScope.orgChart[0]]);
      vm.my_tree_handler(vm.currentOrgId);
    } else {
      Notification.error(languages.findKey('failedToGetOrganizationInformation'));
    }

    // select user
    vm.roleTreeOptions = {
      nodeChildren: "privileges"
    }

    /**
     * 查询用户所属角色
     * @param user
       */
    vm.selectRoleBlongsToUser = function (user) {

      vm.selectedUser = user;
      var roleUserUrl = RENTAL_USER_ROLE_URL;
      roleUserUrl += "?userinfoId=" + user.id;
      //得到角色用户信息
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "GET");
      roleUserPromise.then(function (data) {
        vm.roleList = [];
        angular.forEach(data.content, function (role) {
          var newRoleView = {
            id: role.id,
            name: role.name,
            tree: ''
          }
          vm.roleList.push(newRoleView);
        })


      })

    }

    //点击角色查询包含权限
    vm.selectRole = function (role) {

      if(role.tree!= ''){
        role.tree = '';
      }else {
        var restUrl = ROLE_MENU_LIST_URL;
        restUrl += "?roleId=" + role.id;
        //得到角色Menu信息
        var roleUserPromise = serviceResource.restCallService(restUrl, "GET");
        roleUserPromise.then(function (data) {

          var menuList = commonFactory.unflatten(data.content);

          // 将权限项放到child里
          commonFactory.recursiveChild(menuList, "privileges");

          role.tree = menuList;

        })
      }

    }


    //new user
    vm.addUser = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/RentalSystemMng/UserMng/newRentalUser.html',
        controller: 'newRentalUserController as newRentalUserCtrl',
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
        vm.userinfoList.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    //change password
    vm.updatePassword = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/RentalSystemMng/UserMng/rentalUpdatePassword.html',
        controller: 'rentalUpdatePasswordController as rentalUpdatePasswordCtrl',
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


    //update userinfo
    vm.updateUserInfo = function (usermnginfo,size) {
      var singlUrl = USERINFO_URL + "?id=" + usermnginfo.id;
      var userfoPromis = serviceResource.restCallService(singlUrl, "GET");
      userfoPromis.then(function (data) {
        var operusermnginfo = data.content;
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/rentalPlatform/RentalSystemMng/UserMng/updateRentalUser.html',
          controller: 'updateRentalUserController as updateRentalUserCtrl',
          size: size,
          backdrop: false,
          resolve: {
            usermnginfo: function () {
              return operusermnginfo;
            }
          }
        });

        modalInstance.result.then(function(result) {
          // var tabList=vm.userinfoList;
          // //更新内容
          // for(var i=0;i<tabList.length;i++){
          //   if(tabList[i].id==result.id){
          //     tabList[i]=result;
          //   }
          // }
          var restCallURL = USER_PAGE_URL;
          var pageUrl = 0;
          var sizeUrl = 10000;
          var sortUrl = "id,desc";
          restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
          if (null != vm.currentOrgId && null != vm.currentOrgId) {
            restCallURL += "&search_EQ_organization.id=" + vm.currentOrgId;
          }
          var promise = serviceResource.restCallService(restCallURL, "GET");
          promise.then(function (data) {
            vm.userinfoList = data.content;

          }, function (reason) {
            Notification.error(languages.findKey('failedToGetRoleData'));
          });
        }, function(reason) {
        });

      }, function (reason) {
        Notification.error(languages.findKey('failureToGetUserInfo'));
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
        Notification.error(languages.findKey('failedToGetUserData'));
      });
    }


    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.userinfo = null;
    }

    vm.statusDisable = function (userinfo) {
      $confirm({text: languages.findKey('areYouWantToDisableIt'),title: languages.findKey('disableConfirmation'), ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(USER_STATUS_DISABLE_URL, userinfo.id);
          restPromise.then(function (data) {
            Notification.success(languages.findKey('disableSuccess'));
            vm.updateTable(data.content);

          }, function (reason) {
            Notification.error(languages.findKey('disableError'));
          });
        });
    };

    vm.statusEnable = function (userinfo) {
      $confirm({text: languages.findKey('areYouWantToEnableIt'),title: languages.findKey('enableConfirmation'), ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(USER_STATUS_ENABLE_URL, userinfo.id);
          restPromise.then(function (data) {
            Notification.success(languages.findKey('enableSuccess'));
            vm.updateTable(data.content);
          }, function (reason) {
            Notification.error(languages.findKey('enableError'));
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
        Notification.warning(languages.findKey('selectUserFirstToOperate'));
        return;
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/RentalSystemMng/UserMng/rentalUserRoleMng.html',
        controller: 'rentalUserRoleMngController as rentalUserRoleMngCtrl',
        size: size,
        backdrop: false,
        resolve: {
          userinfo: function () {
            return vm.selectedUser;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.selectRoleBlongsToUser(vm.selectedUser);

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
        templateUrl: 'app/components/rentalPlatform/RentalSystemMng/UserMng/rentalOperationLog.html',
        controller: 'rentalOperationLogController as rentalOperationLogCtrl',
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

  }
})();
