(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rolePrivilegeMngController', rolePrivilegeMngController);

  /** @ngInject */
  function rolePrivilegeMngController($rootScope, $uibModalInstance, MENU_URL, Notification, serviceResource,
                                       commonFactory, ROLE_PRIVILEGE_URL, roleInfo, PRIVILEGE_URL) {
    var vm = this;
    vm.selected = [];
    vm.roleInfo = roleInfo;
    vm.operatorInfo = $rootScope.userInfo;
    vm.my_data = [];

    // select role
    vm.selectRole = function (role) {

      vm.selectedRole = role;

      var restUrl = ROLE_PRIVILEGE_URL;
      restUrl += "?roleId=" + role.id;
      //得到角色Menu信息
      var roleUserPromise = serviceResource.restCallService(restUrl, "GET");
      roleUserPromise.then(function (data) {
        for(var j=0;j < data.content.length; j++){
          vm.selected.push(data.content[j].id);
        }

      })
    }


    vm.init = function () {

      //得到菜单集合
      var promise = serviceResource.restCallService(MENU_URL, "GET");
      promise.then(function (data) {
        vm.my_data = commonFactory.unflatten(data.content);;
        vm.selectRole(vm.roleInfo);
      }, function (reason) {
        Notification.error('获取菜单失败');
      });

    }


    // select menu
    vm.my_tree_handler = function (menu) {

      var restUrl = PRIVILEGE_URL;
      restUrl += "?search_EQ_menuInfo.id=" + menu.id;
      //得到角色Menu信息
      var roleUserPromise = serviceResource.restCallService(restUrl, "GET");
      roleUserPromise.then(function (data) {

        vm.privList  = commonFactory.unflatten(data.content);

      })

    }

    vm.selectMenu = function (menu) {
      vm.privList = menu.privList;

    };

    vm.isSelected = function (privId) {
      return vm.selected.indexOf(privId) >= 0;
    }

    // single select
    vm.updateSelection = function ($event, privId, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, privId);
    }

    var updateSelected = function (action, privId) {
      if (action == 'add' && vm.selected.indexOf(privId) == -1) {
        vm.selected.push(privId);
      }
      if (action == 'remove' && vm.selected.indexOf(privId) != -1) {
        var idx = vm.selected.indexOf(privId);
        vm.selected.splice(idx, 1);
      }
    }

    //关闭选择org的页面
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //
    vm.ok = function () {

      var rspUrl = ROLE_PRIVILEGE_URL;
      rspUrl +="?roleId=" + vm.roleInfo.id + "&privilegeList=" + vm.selected;
      var promise = serviceResource.restCallService(rspUrl, "UPDATE");
      promise.then(function (data) {

        if(data.code ==0){
          Notification.success("修改角色权限成功");
          $uibModalInstance.close(data.content);

        }

      }, function (reason) {
        Notification.error("获取menu数据失败");
      });
    }


    vm.init();


  }
})();
