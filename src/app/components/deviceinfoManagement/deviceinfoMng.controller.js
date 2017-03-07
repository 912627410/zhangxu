(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceinfoMngController', deviceinfoMngController);

  /** @ngInject */

  function deviceinfoMngController($rootScope, $scope, $uibModal,$filter,$http,treeFactory,permissions, Notification, NgTableParams, ngTableDefaults, serviceResource, DEVCE_MONITOR_SINGL_QUERY,DEVCE_PAGED_QUERY, DEFAULT_SIZE_PER_PAGE, DEIVCIE_MOVE_ORG_URL,DEVCEINFO_URL,DEVCEDINFO_EXCELEXPORT,DEVCE_ALLOCATION) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryDeviceinfo = {};
    vm.org = {label: ""};    //所属组织
    vm.allot = {label: ""}; //调拨组织
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
    vm.querySubOrg = true;



    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE; //默认每页记录数
    ngTableDefaults.settings.counts = [];//默认表格设置

    vm.query = function (page, size, sort, deviceinfo) {
      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if (null != deviceinfo) {
        if (null != deviceinfo.deviceNum&&deviceinfo.deviceNum!="") {
          restCallURL += "&search_LIKE_deviceNum=" +$filter('uppercase')(deviceinfo.deviceNum);
        }
        if (null != deviceinfo.phoneNumber&&deviceinfo.phoneNumber!="") {
          restCallURL += "&search_LIKE_sim.phoneNumber=" + deviceinfo.phoneNumber;
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_organization.id=" + vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.deviceinfoList = {};
        Notification.error("获取设备数据失败");
      });
    };

    vm.query(null, null, null, null);


    //重置查询框
    vm.reset = function () {
      vm.org = null;
      vm.queryDeviceinfo.deviceNum = null;
      vm.queryDeviceinfo.phoneNumber = null;
      vm.selectAll = false;//是否全选标志
      vm.selected = []; //选中的设备id
      vm.allot = null;
      vm.querySubOrg = true;
    }


    vm.newDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/newDeviceinfo.html',
        controller: 'newDeviceinfoController as newDeviceinfoController',
        size: size,
        backdrop: false,
        scope: $scope,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };


    vm.updateDeviceinfo = function (id, size) {
      var singlUrl = DEVCEINFO_URL + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          var modalInstance = $uibModal.open({
            animation: vm.animationsEnabled,
            templateUrl: 'app/components/deviceinfoManagement/updateDeviceinfo.html',
            controller: 'updateDeviceinfoController as updateDeviceinfoController',
            size: size,
            backdrop: false,
            resolve: {
              deviceinfo: function () {
                return data.content;
              }
            }
          });

        modalInstance.result.then(function(result) {
         // console.log(result);
          var tabList=vm.tableParams.data;
          //恢复列表中的值
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.id){
              tabList[i]=result;
            }
          }

        }, function(reason) {

        });

        }, function (reason) {
          Notification.error('获取设备信息失败');
        }
      )


    };

    //批量导入
    vm.uploadDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/uploadDeviceinfo.html',
        controller: 'uploadDeviceinfoController as uploadDeviceinfoController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //正常返回
      }, function () {
        //取消
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
      // alert(action);
      vm.tableParams.data.forEach(function (deviceinfo) {
        updateSelected(action, deviceinfo.id);
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

      vm.tableParams.data.forEach(function (deviceinfo) {
        deviceinfo.checked = operStatus;
      })
    }


    //批量设置为已处理
    vm.batchMoveOrg = function () {
      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的设备', positionY: 'top', positionX: 'center'});
        return;
      }


      if (vm.allot== null||vm.allot.label=="") {
        Notification.warning({message: '请选择要调拨的组织', positionY: 'top', positionX: 'center'});

        return;
      }

      if (vm.allot.label== vm.org.label) {
        Notification.warning({message: '相同组织不可以进行调拨', positionY: 'top', positionX: 'center'});

        return;
      }


      var moveOrg = {ids: vm.selected, "orgId": vm.allot.id};
      var restPromise = serviceResource.restUpdateRequest(DEIVCIE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {

        //更新页面显示
        vm.tableParams.data.forEach(function (deviceinfo) {
          //循环table,更新选中的设备
          if(vm.selected.indexOf(deviceinfo.id)!=-1){
            deviceinfo.checked=false;
            deviceinfo.org.label=vm.allot.label;
            var moveTime = new Date();
            deviceinfo.moveTime=moveTime.getTime();
          }
        })
        vm.allot=null;
        vm.selected=[]; //把选中的设备设置为空
        Notification.success("调拨设备成功!");
      //  vm.query(null, null, null, null);
      }, function (reason) {
        Notification.error("调拨设备出错!");
      });


    };


    //读取最新设备信息
    vm.currentDeviceinfo = function (deviceinfo, size) {
      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + deviceinfo.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfoMonitor = data.content;

        //判读是否是高空车
        if(vm.deviceinfoMonitor.versionNum=='A001'){

          $rootScope.currentOpenModal = $uibModal.open({
            animation: vm.animationsEnabled,
            backdrop: false,
            templateUrl: 'app/components/deviceMonitor/deviceAerialCurrentInfo.html',
            controller: 'deviceAerialCurrentInfoController as deviceAerialCurrentInfoController',
            size: size,
            resolve: { //用来向controller传数据
              deviceinfo: function () {
                return vm.deviceinfoMonitor;
              }
            }
          });

        }else{
          $rootScope.currentOpenModal = $uibModal.open({
            animation: vm.animationsEnabled,
            backdrop: false,
            templateUrl: 'app/components/deviceMonitor/devicecurrentinfo.html',
            controller: 'DeviceCurrentInfoController as deviceCurrentInfoCtrl',
            size: size,
            resolve: { //用来向controller传数据
              deviceinfo: function () {
                return vm.deviceinfoMonitor;
              }
            }
          });

        }

        }, function (reason) {
          Notification.error('获取设备信息失败');
        }
      )
    };





    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function(selectedItem){
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
      return permissions.getPermissions("device:oper");
    }

    //导出至Excel
    vm.excelExport=function (org) {

      if (org&&org.id) {
        var filterTerm = "id=" + org.id;
        var restCallURL = DEVCEDINFO_EXCELEXPORT;
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

    vm.allocationlog = function (deviceinfo,size) {



      var singlUrl = DEVCE_ALLOCATION + "?deviceId=" + deviceinfo.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "QUERY");

      deviceinfoPromis.then(function (data) {
        var allocationlog = data;
        var deviceinfodeviceNum =  deviceinfo.deviceNum;

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/deviceinfoManagement/deviceAllocation.html',
          controller: 'deviceAllocationController as deviceAllocationController',
          size: size,
          backdrop: false,
          resolve: {
            deviceinfodeviceNum:function () {
              return deviceinfodeviceNum;
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
