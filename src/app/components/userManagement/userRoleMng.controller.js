(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('userRoleMngController', userRoleMngController);

  /** @ngInject */
  function userRoleMngController($rootScope, $scope, $confirm, $uibModalInstance, NgTableParams, ngTableDefaults, Notification, serviceResource, userService, DEFAULT_SIZE_PER_PAGE, ROLE_PAGE_URL,
                                 USER_ROLE_OPER_URL, USER_ROLE_LIST_URL, userinfo) {
    var vm = this;
    vm.org = {label: ""};    //组织
    vm.operatorInfo = $rootScope.userInfo;
    vm.checked = false;//是否全选标志
    vm.selected = []; //选中的设备id
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.userinfoRoleList = []; //存放用户角色集合
    vm.userinfo = userinfo;
    vm.roleList;
    vm.deleteList = [];
    vm.addList = [];
    vm.otherList = [];



    vm.getUserRole = function () {
      var roleUserUrl = USER_ROLE_LIST_URL;
      roleUserUrl += "?userinfoId=" + vm.userinfo.id;
      //得到设备类型集合
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "QUERY");
      roleUserPromise.then(function (data) {
        //  vm.roleUserinfoList = data;
        for (var i = 0; i < data.length; i++) {
          console.log(data[i]);


          // vm.selected.push(data[i].userinfoId);
          if (null != data[i]) {
            vm.userinfoRoleList.push(data[i].roleId);
          }

        }

        //  console.log(vm.roleUserinfoList);
      }, function (reason) {
    //    Notification.error('获取失败');
      })
    }


    /**
     * 分页查询用户信息
     * @param page
     * @param size
     * @param sort
     * @param priviligeInfo
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

        vm.selected = angular.copy(vm.userinfoRoleList); //深度copy
        vm.roleList = data.content;
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
    vm.query(null, 10, null, null);
    vm.getUserRole();

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.roleInfo = null;
    }


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    var updateSelected = function (action, id) {
      if (action == 'add' && vm.selected.indexOf(id) == -1) {
        vm.selected.push(id);
      }
      if (action == 'remove' && vm.selected.indexOf(id) != -1) {
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx, 1);

      }
    }

    vm.updateSelection = function ($event, id) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');

      //如果有一个不选中,则全选为false
      if (checkbox.checked == false && vm.checked) {
        vm.checked = false;
      }
      updateSelected(action, id);
    }


    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.checked = checkbox.checked;
      // alert(action);
      vm.tableParams.data.forEach(function (userinfo) {
        updateSelected(action, userinfo.id);
      })

    }

    vm.isSelected = function (id) {

      //    console.log(vm.selected);
      return vm.selected.indexOf(id) >= 0;
    }




    //批量设置为已处理
    vm.updateUserRole = function () {


      //得到选中和未选中的记录id
      vm.tableParams.data.forEach(function (roleInfo) {
        if (vm.selected.indexOf(roleInfo.id) != -1) {
          vm.addList.push(roleInfo.id);
        } else {
          vm.otherList.push(roleInfo.id);
        }

      })

      //判断原来是否已经选中,如果是的话,不再传输
      for (var i = 0; i < vm.userinfoRoleList.length; i++) {
        var id = vm.userinfoRoleList[i];
        if (vm.addList.indexOf(id) != -1) {
          var idx = vm.addList.indexOf(id);
          vm.addList.splice(idx, 1);
          //    addList.push(vm.roleUserinfoList[j]);
        }

        if (vm.otherList.indexOf(id) != -1) {
          vm.deleteList.push(id);
        }

      }

      var roleUsers = {addIds: vm.addList, deleteIds: vm.deleteList, "id": vm.userinfo.id};
      var restPromise = serviceResource.restUpdateRequest(USER_ROLE_OPER_URL, roleUsers);
      restPromise.then(function (data) {

        if(data.code==0){
          Notification.success("更新用户成功!");
        }


      }, function (reason) {
        Notification.error(" 更新用户出错!");
      });


    };

  }
})();
