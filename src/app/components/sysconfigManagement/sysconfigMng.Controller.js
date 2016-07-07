/**
 * Created by lqh on 16-6-24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('sysconfigMngController', sysconfigMngController);

  /** @ngInject */
  function sysconfigMngController($rootScope, $scope, $uibModal, $confirm,$filter, NgTableParams, treeFactory,ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, SYS_CONFIG_PAGE_URL, SYS_CONFIG_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, sysconfig) {
      var restCallURL = SYS_CONFIG_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != sysconfig) {

        if (null != sysconfig.name&&sysconfig.name!="") {
          restCallURL += "&search_LIKE_name=" + $filter('uppercase')(sysconfig.name);
        }
        if (null != sysconfig.value&&sysconfig.value!="") {
          restCallURL += "&search_LIKE_value=" + $filter('uppercase')(sysconfig.value);
        }
        if (null != sysconfig.description&&sysconfig.description!="") {
          restCallURL += "&search_LIKE_description=" + $filter('uppercase')(sysconfig.description);
        }

      }


      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        //vm.machineList = null;
        Notification.error("获取系统参数数据失败");
      });
    };


    vm.query();


    //重置查询框
    vm.reset = function () {
      vm.sysconfig = null;
      vm.selected=[]; //把选中的设备设置为空
    }

   //增加系统参数
    vm.newSysconfig = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/sysconfigManagement/newSysconfig.html',
        controller: 'newSysconfigController as newSysconfigController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        //刷新
        // vm.tableParams.data.splice(0, 0, result);
        vm.query();
      }, function () {
        //取消
      });
    };

    //更新系统参数
    vm.updateSysconfig = function (sysconfig, size) {
      var sourceSysconfig = angular.copy(sysconfig); //深度copy

      var singlUrl = SYS_CONFIG_URL + "?id=" + sysconfig.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
        var operSysconfig = data;
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/sysconfigManagement/updateSysconfig.html',
          controller: 'updateSysconfigController as updateSysconfigController',
          size: size,
          backdrop: false,
          resolve: {
            sysconfig: function () {
              return operSysconfig;
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
        Notification.error('获取系统参数信息失败');
      });
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

    vm.updateSelection = function ($event, id, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    }


    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.tableParams.data.forEach(function (machine) {
        updateSelected(action, machine.id);
      })

    }

    vm.isSelected = function (id) {

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

      vm.deviceinfoList.forEach(function (deviceinfo) {
        deviceinfo.checked = operStatus;
      })
    }


  }
})();
