(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('privilegeRoleMngController', privilegeRoleMngController);

  /** @ngInject */
  function privilegeRoleMngController($rootScope, $uibModalInstance,languages,  Notification, serviceResource, ROLE_URL,
                                      PRIVILEGE_ROLE_URL, privilegeInfo) {
    var vm = this;
    vm.selected = [];
    vm.privilegeInfo =privilegeInfo ;

    vm.init = function (privilege) {

      vm.selectedPriv = privilege;

      var roleUserUrl = PRIVILEGE_ROLE_URL;
      roleUserUrl += "?privilegeId=" + privilege.id;
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "GET");
      roleUserPromise.then(function (data) {
        for(var j=0;j < data.content.length; j++){
          vm.selected.push(data.content[j].id);
        }
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetPriviligeStatus'));
      })

    }

    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = angular.copy([$rootScope.orgChart[0]]);

      vm.init(vm.privilegeInfo);
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

      var rspUrl = PRIVILEGE_ROLE_URL;
      rspUrl +="?privilegeId=" + vm.privilegeInfo.id + "&roleList=" + vm.selected;
      var promise = serviceResource.restCallService(rspUrl, "UPDATE");
      promise.then(function (data) {

        if(data.code ==0){
          Notification.success(languages.findKey('successfullyModifiedPriviligeRole'));
          $uibModalInstance.close(data.content);

        }

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetMenuData'));
      });
    }

  }
})();
