/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('deviceUpdateController', deviceUpdateController);

  function deviceUpdateController($rootScope, $filter, $uibModal, $scope, $confirm, languages, Notification, treeFactory, NgTableParams, ngTableDefaults, UPDATE_DEVICE_INFO_QUERY, DEFAULT_DEVICE_SORT_BY, serviceResource, DEFAULT_SIZE_PER_PAGE, CANCEL_UPDATE_URL) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.selectAll = false; //是否全选标志
    vm.selected = []; //选中的设备id

    vm.queryDeviceInfo = function (page, size, sort, deviceinfo) {
      ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
      ngTableDefaults.settings.counts = [];
      var restCallURL = UPDATE_DEVICE_INFO_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != vm.queryOrg&&null!=vm.queryOrg.id) {
        restCallURL += "&search_EQ_organization.id=" +vm.queryOrg.id;
      }

      if (null !=vm.queryDeviceNum&&vm.queryDeviceNum!="") {
        restCallURL += "&search_LIKES_deviceNum=" + $filter('uppercase')(vm.queryDeviceNum);
      }
      if (null != vm.queryMachineLicenseId&&vm.queryMachineLicenseId!="") {
        restCallURL += "&search_LIKES_machine.licenseId=" +$filter('uppercase')(vm.queryMachineLicenseId);
      }
      if (null != vm.queryDeviceType) {
        restCallURL += "&search_INSTRING_versionNum=" + $filter('uppercase')(vm.queryDeviceType);
      } else {
        restCallURL += "&search_LIKES_versionNum=2001,2002,2010,2030,2040";
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
         vm.selected = [];
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      );
    };

    vm.queryDeviceInfo(null, null, null, null);


    var updateSelected = function (action, deviceinfo) {
      if (action == 'add' && vm.selected.indexOf(deviceinfo) == -1) {
        vm.selected.push(deviceinfo);
      }
      if (action == 'remove' && vm.selected.indexOf(deviceinfo) != -1) {
        var idx = vm.selected.indexOf(deviceinfo);
        vm.selected.splice(idx, 1);

      }
    };

    vm.updateSelection = function ($event, deviceinfo, status) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, deviceinfo);
    };


    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.tableParams.data.forEach(function (deviceinfo) {
        updateSelected(action, deviceinfo);
      })

    };

    vm.isSelected = function (deviceinfo) {
      return vm.selected.indexOf(deviceinfo) >= 0;
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
    vm.deviceUpdate = function(deviceinfo, size){
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceUpdate/selectUpdateFile.html',
        controller: 'selectUpdateFileController as selectUpdateFileCtrl',
        size: 'lg',
        backdrop:false,
        scope:$scope,
        resolve: {
          updateDevice: function () {
            return [deviceinfo];
          }
        }
      });
      modalInstance.result.then(function () {
        vm.queryDeviceInfo(null, null, null, null);
        vm.selected =[];
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
      for(var i = 1; i < vm.selected.length; i++) {
        if(vm.selected[i].versionNum != vm.selected[i-1].versionNum) {
          Notification.error({message: '请选择相同协议版本的设备', positionY: 'top', positionX: 'center'});
          return;
        }
      }
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceUpdate/selectUpdateFile.html',
        controller: 'selectUpdateFileController as selectUpdateFileCtrl',
        size: 'lg',
        backdrop:false,
        scope:$scope,
        resolve: {
          updateDevice: function () {
            return vm.selected;
          }
        }
      });
      modalInstance.result.then(function () {
        vm.queryDeviceInfo(null, null, null, null);
        vm.selected =[];
      }, function () {
        //取消
      });
    };

    //取消升级
    vm.cancelUpdate = function(deviceinfo) {

      var updateDataVo = {
        devices: [deviceinfo]
      };

      $confirm({
        title:"操作提示",
        text:"您确定要取消升级?"
      }).then(function () {
        var restPromise = serviceResource.restAddRequest(CANCEL_UPDATE_URL, updateDataVo);
        restPromise.then(function (data) {
          if(data.code == 0){
            Notification.success(data.content);
            vm.queryDeviceInfo(null, null, null, null);
            vm.selected = [];
          }else{
            Notification.error(data.message);
          }
        }, function (reason) {
          Notification.error(reason.data.message);
        });
      })
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
      vm.queryDeviceType = '';
    };
  }
})();
