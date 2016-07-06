/**
 * Created by shuangshan on 16/1/18.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMngController', machineMngController);

  /** @ngInject */
  function machineMngController($rootScope, $scope, $uibModal, $confirm,$filter,permissions, NgTableParams,treeFactory, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, MACHINE_PAGE_URL,MACHINE_UNBIND_DEVICE_URL, MACHINE_MOVE_ORG_URL, MACHINE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.org = {label: ""};    //调拨组织
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, machine) {
      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != machine) {

        if (null != machine.deviceNum&&machine.deviceNum!="") {
          restCallURL += "&search_LIKE_deviceinfo.deviceNum=" + $filter('uppercase')(machine.deviceNum);
        }
        if (null != machine.licenseId&&machine.licenseId!="") {
          restCallURL += "&search_LIKE_licenseId=" + $filter('uppercase')(machine.licenseId);
        }

      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
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
        vm.machineList = null;
        Notification.error("获取车辆数据失败");
      });
    };

    vm.query();

    //重置查询框
    vm.reset = function () {
      vm.machine = null;
      vm.org=null;
      vm.selected=[]; //把选中的设备设置为空
    }


    vm.newMachine = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/newMachine.html',
        controller: 'newMachineController as newMachineController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        //console.log(result);
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    //更新车辆
    vm.updateMachine = function (machine, size) {
      var sourceMachine = angular.copy(machine); //深度copy

      var singlUrl = MACHINE_URL + "?id=" + machine.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
        var operMachine = data.content;
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/machineManagement/updateMachine.html',
          controller: 'updateMachineController as updateMachineController',
          size: size,
          backdrop: false,
          resolve: {
            machine: function () {
              return operMachine;
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
        Notification.error('获取车辆信息失败');
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


    //批量设置为已处理
    vm.batchMoveOrg = function () {

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }


      if (null==vm.org||vm.org.label == "") {
        Notification.warning({message: '请选择要调拨的组织', positionY: 'top', positionX: 'center'});

        return;
      }

      var moveOrg = {ids: vm.selected, "orgId": vm.org.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.tableParams.data.forEach(function (machine) {
          //循环table,更新选中的设备
          if(vm.selected.indexOf(machine.id)!=-1){
            machine.checked=false;
            machine.org.label=vm.org.label;
            // console.log(deviceinfo.org.label);
          }
        })
        vm.org=null;
        vm.selected=[]; //把选中的设备设置为空
        Notification.success("调拨车辆成功!");

      }, function (reason) {
        Notification.error("调拨车辆出错!");
      });


    };




    vm.removeDevice = function (machine) {
      $confirm({text: '确定要解绑吗?',title: '解绑确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(MACHINE_UNBIND_DEVICE_URL, machine.id);
          restPromise.then(function (data) {
            Notification.success("解绑设备成功!");
            vm.query(null, null, null, null);
          }, function (reason) {
            Notification.error("解绑设备出错!");
          });
        });
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow();
    }

    //选中组织模型赋值
    $rootScope.$on('orgSelected', function (event, data) {
      vm.org = data;
    });

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

  }
})();
