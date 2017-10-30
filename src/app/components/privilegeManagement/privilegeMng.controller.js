(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('privilegeMngController', privilegeMngController);

  /** @ngInject */
  function privilegeMngController($rootScope,$confirm, languages,$uibModal, Notification, commonFactory,serviceResource,
                                  PRIVILEGE_ROLE_URL,PRIVILEGE_URL,MENU_URL) {
    var vm = this;
    vm.my_data = [];

    //初始化页面函数
    vm.init = function () {
      //得到菜单集合生成菜单树
      var promise = serviceResource.restCallService(MENU_URL, "GET");
      promise.then(function (data) {
        vm.my_data = commonFactory.unflatten(data.content);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetMenu'));
      });
    }


    // 选择菜单查询权限列表
    vm.my_tree_handler = function (menu) {
      vm.selectedMenu = menu;
      var restUrl = PRIVILEGE_URL;
      restUrl += "?search_EQ_menuInfo.id=" + menu.id;
      var roleUserPromise = serviceResource.restCallService(restUrl, "GET");
      roleUserPromise.then(function (data) {
        vm.privList  = data.content;
      })

    }

    //查询权限列表
    vm.query = function (privilegeInfo) {

      var restCallURL = PRIVILEGE_URL + "?1=1";
      if (null != privilegeInfo) {
        if (null != PRIVILEGE_URL.permission && privilegeInfo.permission != "") {
          //这里包含了特殊字符: 所有需要转移才可以 by riqian.ma 20160614
          restCallURL += "&search_LIKE_permission=" + encodeURIComponent(privilegeInfo.permission);
        }
        if (null != PRIVILEGE_URL.remark ) {
          restCallURL += "&search_LIKE_remark=" + privilegeInfo.remark;
        }
      }
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.privList =  data.content;

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetPriviligeInfo'));
      });
    }


    //重置查询框
    vm.reset = function () {
      vm.privilegeInfo = null;
    }


    //新建权限
    vm.newPrivilege = function (size) {

      if(vm.selectedMenu ==null){
        Notification.warning(languages.findKey('selectTheMenuThatContainsThePrivilige'))
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/privilegeManagement/newPrivilege.html',
        controller: 'newPrivilegeController as newPrivilegeController',
        size: size,
        backdrop: false,
        resolve: {
          menu: function () {
            return vm.selectedMenu;
          }
        }
      });

      modalInstance.result.then(function (result) {

      }, function () {
        //取消
      });
    };

    //更新权限
    vm.updatePrivilege = function (privilegeInfo, size) {

      var sourcePrivilegeInfo = angular.copy(privilegeInfo); //深度copy
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/privilegeManagement/updatePrivilege.html',
        controller: 'updatePrivilegeController as updatePrivilegeController',
        size: size,
        backdrop: false,
        resolve: {
          privilegeInfo: function () {
            return privilegeInfo;
          }
        }
      });

      modalInstance.result.then(function(data) {
        vm.updateTable(data);

      }, function(reason) {
        vm.updateTable(sourcePrivilegeInfo);

      });
    };


    vm.statusDisable = function (privilegeInfo) {
      $confirm({text: languages.findKey('areYouWantToDisableIt'),title: languages.findKey('disableConfirmation'), ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
        .then(function() {
          privilegeInfo.status =0;
          var restPromise = serviceResource.restUpdateRequest(PRIVILEGE_URL, privilegeInfo);
          restPromise.then(function (data) {
            Notification.success(languages.findKey('disableSuccess'));
            vm.updateTable(data.content);

          }, function (reason) {
            Notification.error(languages.findKey('disableError'));
          });
        });
    };

    vm.statusEnable = function (privilegeInfo) {
      $confirm({text: languages.findKey('areYouWantToEnableIt'),title: languages.findKey('enableConfirmation'), ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
        .then(function() {
          privilegeInfo.status =1;
          var restPromise = serviceResource.restUpdateRequest(PRIVILEGE_URL, privilegeInfo);
          restPromise.then(function (data) {
            Notification.success(languages.findKey('enableSuccess'));
            vm.updateTable(data.content);
          }, function (reason) {
            Notification.error(languages.findKey('enableError'));
          });
        });
    };

    vm.updateTable=function(content){
      for(var i=0;i<vm.privList.length;i++){
        if(vm.privList[i].id==content.id){
          vm.privList[i]=content;
        }
      }
    }

    vm.selectPrivilege = function (privilege) {

      vm.selectedPriv = privilege;

      var roleUserUrl = PRIVILEGE_ROLE_URL;
      roleUserUrl += "?privilegeId=" + privilege.id;
      //得到设备类型集合
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "GET");
      roleUserPromise.then(function (data) {
        vm.roleList = data.content;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetPriviligeStatus'));
      })

    }


    /**
     * 隶属角色管理
     * @param size
     */
    vm.privilegeRoleManage = function (privilegeInfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/privilegeManagement/privilegeRoleMng.html',
        controller: 'privilegeRoleMngController as privilegeRoleMngController',
        size: size,
        backdrop: false,
        resolve: {
          privilegeInfo: function () {
            return privilegeInfo;
          }
        }
      });
      modalInstance.result.then(function (result) {
        vm.selectPrivilege(privilegeInfo);

      }, function () {
        //取消
      });
    };

    vm.newMenu = function () {
      if(vm.selectedMenu == null){
        Notification.warning(languages.findKey('selectTheSuperiorMenu'));
        return;
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/privilegeManagement/newMenu.html',
        controller: 'newMenuController as newMenuController',
        size: 'md',
        backdrop: false,
        resolve: {
          parentMenu: function () {
            return vm.selectedMenu;
          }
        }
      });

      modalInstance.result.then(function (result) {

      }, function () {
        //取消
      });
    }

    vm.init();

  }
})();
