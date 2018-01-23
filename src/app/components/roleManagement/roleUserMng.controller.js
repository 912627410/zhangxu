(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('roleUserMngController', roleUserMngController);

  /** @ngInject */
  function roleUserMngController($rootScope,languages,  $uibModalInstance, ROLE_USER_URL, Notification, serviceResource,roleInfo,USER_PAGE_URL) {
    var vm = this;
    vm.roleInfo = roleInfo;
    vm.selected = [];

    //
    vm.getRoleUsers = function (roleInfo) {
      var roleUserUrl = ROLE_USER_URL;
      roleUserUrl += "?roleId=" + roleInfo.id;
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "GET");
      roleUserPromise.then(function (data) {
        for (var i = 0; i < data.content.length; i++) {
          if (null != data.content[i]) {
            vm.selected.push(data.content[i].userinfoId);
          }
        }

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetPriviligeStatus'));
      })
    }


    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = angular.copy([$rootScope.orgChart[0]]);

      vm.getRoleUsers(vm.roleInfo);
    } else {
      Notification.error(languages.findKey('failedToGetOrganizationInformation'));
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
        Notification.error(languages.findKey('failedToGetRoleData'));
      });
    }

    vm.isSelected = function (userId) {
      return vm.selected.indexOf(userId) >= 0;
    }

    // single select
    vm.updateSelection = function ($event, userId, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, userId);
    }

    var updateSelected = function (action, userId) {
      if (action == 'add' && vm.selected.indexOf(userId) == -1) {
        vm.selected.push(userId);
      }
      if (action == 'remove' && vm.selected.indexOf(userId) != -1) {
        var idx = vm.selected.indexOf(userId);
        vm.selected.splice(idx, 1);
      }
    }

    //关闭选择org的页面
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //
    vm.ok = function () {
      var rspUrl = ROLE_USER_URL;
      rspUrl +="?roleId=" + vm.roleInfo.id + "&userList=" + vm.selected;
      var promise = serviceResource.restCallService(rspUrl, "UPDATE");
      promise.then(function (data) {

        if(data.code ==0){
          Notification.success(languages.findKey('successfullyModifiedRolePrivilige'));
          $uibModalInstance.close(data.content);
        }
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetMenuData'));
      });
    }
  }
})();
