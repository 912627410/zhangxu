(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('roleUserMngController', roleUserMngController);

  /** @ngInject */
  function roleUserMngController($rootScope, $scope, $confirm, $uibModalInstance, NgTableParams,treeFactory, ngTableDefaults, Notification, serviceResource, userService, DEFAULT_SIZE_PER_PAGE, USER_PAGE_URL, ROLE_USER_OPER_URL, ROLE_USER_LIST_URL, roleInfo) {
    var vm = this;
    vm.org = {label: ""};    //组织
    vm.operatorInfo = $rootScope.userInfo;
    vm.checked = false;//是否全选标志
    vm.selected = []; //选中的设备id
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    vm.userinfoStatusList; //用户状态
    vm.roleUserinfoList = []; //存放用户角色集合
    vm.roleInfo = roleInfo;
    vm.userinfoList;

    // console.log(vm.roleInfo);

    var promise = userService.queryStatusList();
    promise.then(function (data) {
      vm.userinfoStatusList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取权限状态失败');
    })


    var getRoleUserState,queryState,queryResult;
    function queryFn(){
      vm.selected = angular.copy(vm.roleUserinfoList); //深度copy
      vm.roleList = queryResult.content;
      vm.tableParams = new NgTableParams({},
        {
          dataset: queryResult.content
        });
      vm.page = queryResult.page;
      vm.pageNumber = queryResult.page.number + 1;
    }

    vm.getRoleUser = function () {
      var roleUserUrl = ROLE_USER_LIST_URL;
      roleUserUrl += "?roleId=" + vm.roleInfo.id;
      //得到设备类型集合
      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "QUERY");
      roleUserPromise.then(function (data) {
        //  vm.roleUserinfoList = data;
        for (var i = 0; i < data.length; i++) {
         // console.log(data[i]);


          // vm.selected.push(data[i].userinfoId);
          if (null != data[i]) {
            vm.roleUserinfoList.push(data[i].userinfoId);
          }

        }



        //  console.log(vm.roleUserinfoList);
      }, function (reason) {
        Notification.error('获取权限状态失败');
      })
      if(queryState){
        queryFn()
      }else{
        getRoleUserState=true;
      }
    }


    //初始化查询参数
    vm.uesrinfo = {
      "ssn": ""
    };

    //查询条件相关

    vm.openOrgTree = function () {
      //vm.showOrgTree = !vm.showOrgTree;
      treeFactory.treeShow(function (selectedItem) {
        vm.org = selectedItem;
      });
    }


    vm.hideOrgTree = function () {
     // vm.showOrgTree = false;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })




    /**
     * 分页查询用户信息
     * @param page
     * @param size
     * @param sort
     * @param priviligeInfo
     */
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
        queryResult=data;
        if(getRoleUserState){
          queryFn()
        }else{
          queryState=true;
        }

      }, function (reason) {
        Notification.error("获取角色数据失败");
      });
    }

    //首次查询
    vm.init=function(){
      $LAB.script().wait(function () {
        vm.query(null, 10, null, null);
        vm.getRoleUser();



      })
    }

    vm.init();


    /**
     * 重置查询框
     */
    vm.reset = function () {
      // vm.userinfo = null;
      // vm.org = null;
     vm.priviligeInfo=null;
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
    vm.checkAll = function () {
      var operStatus = false;
      if (vm.selectAll) {
        operStatus = false;
        vm.selectAll = false;
      } else {
        operStatus = true;
        vm.selectAll = true;
      }

      vm.userinfoList.forEach(function (userinfo) {
        userinfo.checked = operStatus;
      })
    }


    //批量设置为已处理
    vm.updateRoleUser = function () {

      vm.deleteList = [];
      vm.addList = [];
      vm.otherList = [];

      //得到选中和未选中的记录id
      vm.tableParams.data.forEach(function (userinfo) {
        if (vm.selected.indexOf(userinfo.id) != -1) {
          vm.addList.push(userinfo.id);
        } else {
          vm.otherList.push(userinfo.id);
        }

      })

      //判断原来是否已经选中,如果是的话,不再传输
      for (var i = 0; i < vm.roleUserinfoList.length; i++) {
        var id = vm.roleUserinfoList[i];
        if (vm.addList.indexOf(id) != -1) {
          var idx = vm.addList.indexOf(id);
          vm.addList.splice(idx, 1);
          //    addList.push(vm.roleUserinfoList[j]);
        }

        if (vm.otherList.indexOf(id) != -1) {
          vm.deleteList.push(id);
        }

      }

      var roleUsers = {addIds: vm.addList, deleteIds: vm.deleteList, "id": vm.roleInfo.id};
      var restPromise = serviceResource.restUpdateRequest(ROLE_USER_OPER_URL, roleUsers);
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
