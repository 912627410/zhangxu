/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('deviceUpdateController', deviceUpdateController);

  function deviceUpdateController($rootScope, $filter, $uibModal, $scope, languages, Notification, treeFactory, NgTableParams, ngTableDefaults, UPDATE_DEVICE_INFO_QUERY, DEFAULT_DEVICE_SORT_BY, serviceResource, DEFAULT_SIZE_PER_PAGE) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.selectAll = false; //是否全选标志
    vm.selected = []; //选中的设备id

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.queryDeviceInfo = function (page, size, sort, deviceinfo) {
      var restCallURL = UPDATE_DEVICE_INFO_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != vm.queryOrg&&null!=vm.queryOrg.id) {
        restCallURL += "&search_EQ_organization.id=" +vm.queryOrg.id;
      }

      if (null !=vm.queryDeviceNum&&vm.queryDeviceNum!="") {
        restCallURL += "&search_LIKE_deviceNum=" + $filter('uppercase')(vm.queryDeviceNum);
      }
      if (null != vm.queryMachineLicenseId&&vm.queryMachineLicenseId!="") {
        restCallURL += "&search_LIKE_machine.licenseId=" +$filter('uppercase')(vm.queryMachineLicenseId);
      }

      var deviceDataPromis = serviceResource.restCallService(restCallURL, "GET");
      deviceDataPromis.then(function (data) {
          vm.deviceInfoList = data.content;
          vm.tableParams = new NgTableParams({},
            {
              dataset: data.content
            });
         vm.page = data.page;
         vm.deviceData_pagenumber = data.page.number + 1;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      );
    };

    vm.queryDeviceInfo(null, null, null, null);


    var updateSelected = function (action, id) {
      if (action == 'add' && vm.selected.indexOf(id) == -1) {
        vm.selected.push(id);
      }
      if (action == 'remove' && vm.selected.indexOf(id) != -1) {
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx, 1);

      }
    };

    vm.updateSelection = function ($event, id, status) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };


    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.tableParams.data.forEach(function (deviceinfo) {
        updateSelected(action, deviceinfo.id);
      })

    };

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    };
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
    };

    //单台设备升级
    vm.deviceUpdate = function(id, size){
      var updateId = [id];
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceUpdate/selectUpdateFile.html',
        controller: 'selectUpdateFileController as selectUpdateFileCtrl',
        size: size,
        backdrop:false,
        scope:$scope,
        resolve: {
          updateDeviceId: function () {
            return updateId;
          }
        }
      });
      modalInstance.result.then(function () {
        vm.queryDeviceInfo();
      }, function () {
        //取消
      });
    };

    //批量升级
    vm.batchUpdate = function(size){
      if(vm.selected.length == 0){
        Notification.warning({message: '请选择要升级的设备', positionY: 'top', positionX: 'center'});
        return;
      }
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceUpdate/selectUpdateFile.html',
        controller: 'selectUpdateFileController as selectUpdateFileCtrl',
        size: size,
        backdrop:false,
        scope:$scope,
        resolve: {
          updateDeviceId: function () {
            return vm.selected;
          }
        }
      });
      modalInstance.result.then(function () {
        vm.queryDeviceInfo();
      }, function () {
        //取消
      });
    };

    //组织树的显示
    vm.openTreeInfo = function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.queryOrg =selectedItem;
      });
    };

    //重置查询框
    vm.reset = function(){
      vm.queryMachineLicenseId = '';
      vm.queryDeviceNum = '';
      vm.queryOrg = '';
    };
  }
})();
