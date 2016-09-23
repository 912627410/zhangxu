(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rolePriviligeMngController', rolePriviligeMngController);

  /** @ngInject */
  function rolePriviligeMngController($rootScope, $scope, $confirm, $uibModalInstance, NgTableParams, ngTableDefaults, Notification, serviceResource, priviligeService, DEFAULT_SIZE_PER_PAGE, PRIVILAGE_PAGE_URL, ROLE_PRIVILAGE_OPER_URL, ROLE_PRIVILAGE_LIST_URL, roleInfo) {
    var vm = this;
    vm.org = {label: ""};    //组织
    vm.operatorInfo = $rootScope.userInfo;
    vm.checked = false;//是否全选标志
    vm.selected = []; //选中的设备id
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    vm.priviligeStatusList; //用户状态
    vm.roleUserinfoList = []; //存放用户角色集合
    vm.roleInfo = roleInfo;
    vm.rolePriviligeList=[];

    // console.log(vm.roleInfo);

    var promise = priviligeService.queryStatusList();
    promise.then(function (data) {
      vm.priviligeStatusList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取权限状态失败');
    })

    var getRolePriviligeState,queryState,queryResult;
    function queryFn(){
      vm.selected = angular.copy(vm.rolePriviligeList); //深度copy
      vm.tableParams = new NgTableParams({},
        {
          dataset: queryResult.content
        });
      vm.page = queryResult.page;
      vm.pageNumber = queryResult.page.number + 1;
    }


    vm.getRolePrivilige = function () {
      var roleUserUrl = ROLE_PRIVILAGE_LIST_URL;
      roleUserUrl += "?roleId=" + vm.roleInfo.id;

      var roleUserPromise = serviceResource.restCallService(roleUserUrl, "QUERY");
      roleUserPromise.then(function (data) {
        for (var i = 0; i < data.length; i++) {
          if (null != data[i]) {
            vm.rolePriviligeList.push(data[i].priviligeId);
          }

        }

        if(queryState){
          queryFn()
        }else{
          getRolePriviligeState=true;
        }

        //  console.log(vm.roleUserinfoList);
      }, function (reason) {
        Notification.error('获取权限状态失败');
      })
    }


    //初始化查询参数
    vm.uesrinfo = {
      "ssn": ""
    };

    //查询条件相关

    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }


    vm.hideOrgTree = function () {
      vm.showOrgTree = false;
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
    vm.query = function (page, size, sort, priviligeInfo) {

      //构造查询条件
      var restCallURL = PRIVILAGE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != priviligeInfo) {
        if (null != priviligeInfo.permission && priviligeInfo.permission != "") {
          //这里包含了特殊字符: 所有需要转移才可以 by riqian.ma 20160614
          restCallURL += "&search_LIKE_permission=" + encodeURIComponent(priviligeInfo.permission);
        }

        if (null != priviligeInfo.status ) {
          restCallURL += "&search_EQ_status=" + priviligeInfo.status.value;
        }

      }
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {



        queryResult=data;
        if(getRolePriviligeState){
          queryFn()
        }else{
          queryState=true;
          vm.getRolePrivilige();
        }
      }, function (reason) {
        Notification.error("获取角色数据失败");
      });
    }

    vm.init=function(){
      $LAB.script().wait(function () {
        vm.query(null, 10, null, null);
        vm.getRolePrivilige();



      })
    }

    vm.init();

    /**
     * 重置查询框
     */
    vm.reset = function () {
      //vm.uesrinfo = null;
      //vm.org = null;
      vm.priviligeInfo = null;
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
      vm.tableParams.data.forEach(function (privilige) {
        updateSelected(action, privilige.id);
      })

    }

    vm.isSelected = function (id) {

      //    console.log(vm.selected);
      return vm.selected.indexOf(id) >= 0;
    }

    //批量设置为已处理
    vm.updateRolePrivilige = function () {

      vm.deleteList = [];
      vm.addList = [];
      vm.otherList = [];

      //得到选中和未选中的记录id
      vm.tableParams.data.forEach(function (privilige) {
        if (vm.selected.indexOf(privilige.id) != -1) {
          vm.addList.push(privilige.id);
        } else {
          vm.otherList.push(privilige.id);
        }

      })


      //判断原来是否已经选中,如果是的话,不再传输
      for (var i = 0; i < vm.rolePriviligeList.length; i++) {
        var id = vm.rolePriviligeList[i];
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
      var restPromise = serviceResource.restUpdateRequest(ROLE_PRIVILAGE_OPER_URL, roleUsers);
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
