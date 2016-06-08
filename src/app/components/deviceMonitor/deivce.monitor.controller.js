/**
 * Created by shuangshan on 16/1/6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */
  function DeviceMonitorController($rootScope, $scope, $uibModal, $timeout, $filter, $translate,languages,treeFactory,NgTableParams, ngTableDefaults, DEVCE_MONITOR_SINGL_QUERY, DEVCE_MONITOR_PAGED_QUERY, DEFAULT_DEVICE_SORT_BY, DEFAULT_SIZE_PER_PAGE, AMAP_QUERY_TIMEOUT_MS, serviceResource, Notification) {
    var vm = this;

    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    var userInfo = $rootScope.userInfo;
    vm.refreshMainMap = function (deviceList) {
      $timeout(function () {
        serviceResource.refreshMapWithDeviceInfo("monitorMap", deviceList);
      })
    }

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.radioListType = "list";
    //这里的延时是因为从高德查询当前位置是异步返回的,如果不延时页面就无法加载正常的数据,延时时间根据网速调整
    //已废弃
    vm.refreshDOM = function () {
      setTimeout(function () {
        vm.setDefaultAddress();
        $scope.$apply();
      }, AMAP_QUERY_TIMEOUT_MS);
    };

    vm.setDefaultAddress = function () {
      if (vm.deviceInfoList != null) {
        vm.deviceInfoList.forEach(function (deviceInfo) {
          if (deviceInfo.address === languages.findKey('requestingLocationData')+'...') {
            deviceInfo.address = '--';
          }
        })
      }
    }

    vm.queryDeviceInfo = function (page, size, sort, deviceinfo) {
      //if (queryCondition){
      //  var filterTerm = "search_LIKE_deviceNum=" + $filter('uppercase')(queryCondition);
      //}

      var restCallURL = DEVCE_MONITOR_PAGED_QUERY;
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


      // var deviceDataPromis = serviceResource.queryDeviceMonitorInfo(page, size, sort, filterTerm);
      var deviceDataPromis = serviceResource.restCallService(restCallURL, "GET");
      deviceDataPromis.then(function (data) {
          vm.deviceInfoList = data.content;
          vm.tableParams = new NgTableParams({},
            {
              dataset: data.content
            });
          vm.page = data.page;
          vm.deviceData_pagenumber = data.page.number + 1;
          vm.basePath = DEVCE_MONITOR_PAGED_QUERY;
          //地图数据
          vm.refreshMainMap(vm.deviceInfoList);
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
      //vm.refreshDOM();  改为直接从后台返回
    }

    if (userInfo == null) {
      $rootScope.$state.go('home.login');
    }
    else {
      vm.queryDeviceInfo(0, null, null, null);
    }

//监控
    vm.currentInfo = function (id, size) {

      console.log(size);
      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfoMonitor = data.content;
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

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    };


    vm.reset = function () {
      vm.queryDeviceNum = null;
      vm.queryMachineLicenseId = null;
      vm.queryOrg = null;
    }

    //组织树的显示
   vm.openTreeInfo=function() {
     treeFactory.treeShow();
   }

    //选中组织模型赋值
    $rootScope.$on('orgSelected', function (event, data) {
      vm.queryOrg = data;
    });

  }
})();
