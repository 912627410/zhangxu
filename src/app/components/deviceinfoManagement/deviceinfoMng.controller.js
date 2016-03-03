(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceinfoMngController', deviceinfoMngController);

  /** @ngInject */
  function deviceinfoMngController($rootScope, $scope, $uibModal, Notification, NgTableParams, ngTableDefaults, serviceResource, DEVCE_PAGED_QUERY, DEFAULT_SIZE_PER_PAGE, DEIVCIE_MOVE_ORG_URL,DEVCEINFO_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";
    vm.deviceinfo = {};

    vm.org = {label: ""};    //调拨组织


    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //查询条件相关
    vm.showOrgTree = false;
    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })


    vm.showMoveOrgTree = false;
    vm.openMoveOrgTree = function () {
      vm.showMoveOrgTree = !vm.showMoveOrgTree;
    }

    $scope.$on('showMoveOrgEvent', function (event, data) {
      vm.selectedMoveOrg = data;
      vm.deviceinfo.moveOrg = vm.selectedMoveOrg;
      vm.showMoveOrgTree = false;
    })


    vm.query = function (page, size, sort, deviceinfo) {
      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != deviceinfo) {
        // alert(deviceinfo.phoneNumber);
        //alert(deviceinfo.org.id);
        //alert(deviceinfo.deviceNum);
        if (null != deviceinfo.org) {
          restCallURL += "&search_EQ_organization.id=" + deviceinfo.org.id;
        }
        if (null != deviceinfo.deviceNum) {
          restCallURL += "&search_LIKE_deviceNum=" + deviceinfo.deviceNum;
        }
        if (null != deviceinfo.phoneNumber) {
          restCallURL += "&search_LIKE_sim.phoneNumber=" + deviceinfo.phoneNumber;
        }

      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        //  vm.deviceinfoList = data.content;

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });

        //  alert(vm.deviceinfoList[0].id);
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.deviceinfoList = {};
        Notification.error("获取设备数据失败");
      });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN") {
      vm.query(null, null, null, null);
    }

    //重置查询框
    vm.reset = function () {
      vm.deviceinfo.org = null;
      vm.deviceinfo.deviceNum = null;
      vm.deviceinfo.phoneNumber = null;
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

      modalInstance.result.then(function () {
        //刷新
         vm.query();
      }, function () {
        //取消
      });
    };


    vm.updateDeviceinfo = function (id, size) {
      var singlUrl = DEVCEINFO_URL + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfo = data.content;
          var modalInstance = $uibModal.open({
            animation: vm.animationsEnabled,
            templateUrl: 'app/components/deviceinfoManagement/updateDeviceinfo.html',
            controller: 'updateDeviceinfoController as updateDeviceinfoController',
            size: size,
            backdrop: false,
            resolve: {
              deviceinfo: function () {
                return vm.deviceinfo;
              }
            }
          });

          modalInstance.result.then(function (selectedItem) {
            //  vm.selected = selectedItem;
             vm.query();
          }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
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


    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

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
      //   alert(vm.selected);
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
        alert("请选择要调拨的设备");
        return;
      }


      if (vm.org.label == "") {
        alert("请选择要调拨的组织");
        return;
      }

      //alert(vm.org.id+" "+vm.org.label);

      var moveOrg = {ids: vm.selected, "orgId": vm.org.id};
      // alert(moveOrg.ids+"  "+moveOrg.orgId);


      var restPromise = serviceResource.restUpdateRequest(DEIVCIE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        Notification.success("调拨设备成功!");
        vm.query(null, null, null, null);
      }, function (reason) {
        Notification.error("调拨设备出错!");
      });


    };


    //激活设备
    vm.activeDeviceinfo = function (deviceinfo, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/activeDeviceinfo.html',
        controller: 'activeDeviceinfoController as activeDeviceinfoController',
        size: size,
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return deviceinfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        //  vm.selected = selectedItem;
        //  vm.query();
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };
  }
})();
