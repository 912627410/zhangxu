/**
 * @author songyutao
 * @create 2017-07-04
 * @email yutao.song@nvr-china.com
 * @describe 组织与车辆类型模态框页面的Js
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('orgMachineTypeMngController', orgMachineTypeMngController);

  /** @ngInject */
  function orgMachineTypeMngController($rootScope,$scope, $uibModal,$uibModalInstance, NgTableParams, ngTableDefaults, Notification, serviceResource,ORG_MACHINE_TYPE_URL, DEFAULT_SIZE_PER_PAGE,orgInfo, MACHINE_TYPE_URL,USER_MACHINE_TYPE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.selected = []; //选中的设备id
    vm.checked = false;//是否全选标志

    vm.orgInfo = orgInfo;//当前组织用户信息
    vm.orgMachineTypeInfoList = []; //存放组织车辆类型集合


    // vm.orgTypeList;
    var getRoleUserState,queryState,queryResult;
    function queryMachinrType(){
      vm.selected = angular.copy(vm.orgMachineTypeInfoList); //深度copy，绑定默认选中车型
      vm.roleList = queryResult.content;
      vm.tableParams = new NgTableParams({},
        {
          dataset: queryResult.content
        });
      vm.page = queryResult.page;
      vm.pageNumber = queryResult.page.number + 1;

    }

    //初始化查询参数
    vm.machineTypeInfo = {
      "name": ""
    };


    /**
     * 分页查询
     * @param page
     * @param size
     * @param sort
     * @param machineTypeInfo
     */
    vm.query = function (page, size, sort, machineTypeInfo) {
      //构造查询条件
      var restCallURL = MACHINE_TYPE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,asc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != machineTypeInfo) {
        if (null != machineTypeInfo.typeName && machineTypeInfo.typeName != "") {
          restCallURL += "&search_LIKE_typeName=" + machineTypeInfo.typeName;
        }

      }
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.selected = angular.copy(vm.orgMachineTypeInfoList); //深度copy，绑定默认选中车型
        vm.tableParams = new NgTableParams({},
          {
            dataset: data.content
          });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取车辆类型数据失败");
      });
    }

    //首次查询
    vm.init=function(){
      var orgMachineTypeUrl = ORG_MACHINE_TYPE_URL;
      orgMachineTypeUrl += "?orgId=" + vm.orgInfo.id;
      //得到设备类型集合
      var orgMachineTypePromise = serviceResource.restCallService(orgMachineTypeUrl, "QUERY");
      orgMachineTypePromise.then(function (data) {
        for (var i = 0; i < data.length; i++) {
          if (null != data[i]) {
            vm.orgMachineTypeInfoList.push(data[i].machineTypeId);
          }
        }
        vm.query(null, 10, null, null);
      })
    }

    vm.init();

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.machineTypeInfo = null;
    }

    //定义input:是选中与否
    var updateSelected = function (action, id) {
      if (action == 'add' && vm.selected.indexOf(id) == -1) {
        vm.selected.push(id);
      }
      if (action == 'remove' && vm.selected.indexOf(id) != -1) {
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx, 1);

      }
    }

    //选中全部input
    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.checked = checkbox.checked;
      vm.tableParams.data.forEach(function (machineTypeInfo) {
        updateSelected(action, machineTypeInfo.id);
      })

    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }
    //执行单个input选中与否
    vm.updateSelection = function ($event, id) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');

      //如果有一个不选中,则全选为false
      if (checkbox.checked == false && vm.checked) {
        vm.checked = false;
      }
      updateSelected(action, id);
    }

    //更新按钮处理
    vm.updateOrgMachineType = function () {

      vm.deleteList = [];
      vm.addList = [];
      vm.otherList = [];

      //得到选中和未选中的记录id
      vm.tableParams.data.forEach(function (machineTypeInfo) {
        if (vm.selected.indexOf(machineTypeInfo.id) != -1) {
          vm.addList.push(machineTypeInfo.id);
        } else {
          vm.otherList.push(machineTypeInfo.id);
        }

      })

      //判断原来是否已经选中,如果是的话,不再传输
      for (var i = 0; i < vm.orgMachineTypeInfoList.length; i++) {
        var id = vm.orgMachineTypeInfoList[i];
        if (vm.addList.indexOf(id) != -1) {
          var idx = vm.addList.indexOf(id);
          vm.addList.splice(idx, 1);
        }

        if (vm.otherList.indexOf(id) != -1) {
          vm.deleteList.push(id);
        }

      }

      var orgMachineType = {addIds: vm.addList, deleteIds: vm.deleteList ,"id": vm.orgInfo.id };
      var restPromise = serviceResource.restUpdateRequest(ORG_MACHINE_TYPE_URL, orgMachineType);
      restPromise.then(function (data) {

        if(data.code==0){
          Notification.success("更新用户成功!");
        }
        $uibModalInstance.close(data.content);
      }, function (reason) {
        Notification.error(" 更新用户出错!");
      });


    };
    //取消按钮
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
