/**
 * Created by shuangshan on 16/1/18.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMngController', machineMngController);

  /** @ngInject */
  function machineMngController($rootScope, $scope, $uibModal,$http,  $confirm,$filter,permissions, NgTableParams,
                                treeFactory, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE,
                                MACHINE_PAGE_URL,MACHINE_UNBIND_DEVICE_URL, MACHINE_MOVE_ORG_URL,
                                MACHINE_URL,MACHINE_ALLOCATION,MACHINE_EXCELEXPORT,USER_MACHINE_TYPE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.org = {label: ""};    //所属组织
    vm.allot = {label: ""}; //调拨组织
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


    //查询当前用户拥有的车辆类型明细
    vm.getMachineType = function(){
      var restCallURL = USER_MACHINE_TYPE_URL;
      if(vm.operatorInfo){
        restCallURL += "?orgId="+ vm.operatorInfo.userdto.organizationDto.id;
      }
      var rspData = serviceResource.restCallService(restCallURL, "QUERY");
      rspData.then(function (data) {

        vm.machineTypeList = data;
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取车辆类型数据失败");
      });
    }
    vm.getMachineType();

    //重置查询框
    vm.reset = function () {
      vm.machine = null;
      vm.org=null;
      vm.selected=[]; //把选中的设备设置为空
      vm.allot=null;
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
          },
          machineTypeInfo: function () {
            return vm.machineTypeList;
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
            },
            machineTypeInfo: function () {
              return vm.machineTypeList;
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

    //批量导入
    vm.uploadMachine = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/uploadMachine.html',
        controller: 'uploadMachineController as uploadMachineController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        for(var i=0; i <result.length;i++){
          vm.tableParams.data.splice(0, 0, result[i]);

        }

      }, function () {
        //取消
      });
    };

    //导出至Excel
    vm.excelExport=function (org) {

      if (org&&org.id) {
        var filterTerm = "id=" + org.id;
        var restCallURL = MACHINE_EXCELEXPORT;
        if (filterTerm){
          restCallURL += "?";
          restCallURL += filterTerm;
        }
        if(vm.querySubOrg) {
          restCallURL += "&parentOrgId="+ org.id;
        }

        $http({
          url: restCallURL,
          method: "GET",
          responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {
          var blob = new Blob([data], { type: "application/vnd.ms-excel" });
          var objectUrl = window.URL.createObjectURL(blob);

          var anchor = angular.element('<a/>');
          anchor.attr({
            href: objectUrl,
            target: '_blank',
            download: org.label +'.xls'
          })[0].click();

        }).error(function (data, status, headers, config) {
          Notification.error("下载失败!");
        });
      }else {
        Notification.error("请选择所属组织!");
      }

    }




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


    //批量调拨
    vm.batchMoveOrg = function () {

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }


      if (null==vm.allot||vm.allot.label == "") {
        Notification.warning({message: '请选择要调拨的组织', positionY: 'top', positionX: 'center'});

        return;
      }

      if(vm.allot.label==vm.org.label){
        Notification.warning({message: '相同组织不可以进行调拨', positionY: 'top', positionX: 'center'});

        return;
      }

      var moveOrg = {ids: vm.selected, "orgId": vm.allot.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.tableParams.data.forEach(function (machine) {
          //循环table,更新选中的设备
          if(vm.selected.indexOf(machine.id)!=-1){
            machine.checked=false;
            machine.org.label=vm.allot.label;
          }
        })
        vm.allot=null;
        vm.selected=[]; //把选中的设备设置为空
        if (data.result){
          Notification.success("调拨车辆成功!"+data.result);
        }else {
          Notification.success("调拨车辆成功!");
        }
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
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }
    //调拨组织组织树的显示
    vm.openTreeInfoAllot=function () {
      treeFactory.treeShow(function (selectedItem) {
        vm.allot =selectedItem;
      });
    };

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    vm.allocationlog = function (machine,size) {



      var singlUrl = MACHINE_ALLOCATION + "?machineId=" + machine.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "QUERY");

      deviceinfoPromis.then(function (data) {
        var allocationlog = data;
        var machinelicenseId =  machine.licenseId;

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/machineManagement/machineAllocation.html',
          controller: 'machineAllocationController as machineAllocationController',
          size: size,
          backdrop: false,
          resolve: {
            machinelicenseId:function () {
              return machinelicenseId;
            },
            allocationlog:function () {
              return allocationlog;
            }
          }
        });

        modalInstance.result.then(function () {

        });
      }, function (reason) {
        Notification.error('获取调拨日志失败');
      });
    }
  }
})();
