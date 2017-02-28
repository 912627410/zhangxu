/**
 * Created by shuangshan on 16/1/6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */

  function DeviceMonitorController($rootScope, $scope,$http, $uibModal, $timeout, $filter, permissions,$translate,languages,treeFactory,NgTableParams, ngTableDefaults, DEVCE_MONITOR_SINGL_QUERY, DEVCE_MONITOR_PAGED_QUERY, DEFAULT_DEVICE_SORT_BY, DEFAULT_SIZE_PER_PAGE, AMAP_QUERY_TIMEOUT_MS, serviceResource, Notification,DEVCEMONITOR_EXCELEXPORT) {
    var vm = this;

    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    var userInfo = $rootScope.userInfo;
    vm.querySubOrg = true;
    vm.queryLinkage = false;

    vm.refreshMainMap = function (deviceList) {
      $timeout(function () {
        serviceResource.refreshMapWithDeviceInfo("monitorMap", deviceList,4);
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
      if (null != vm.queryOrg&&null!=vm.queryOrg.id&&!vm.querySubOrg) {
        restCallURL += "&search_EQ_organization.id=" +vm.queryOrg.id;
      }
      if (null !=vm.queryDeviceNum&&vm.queryDeviceNum!="") {
        restCallURL += "&search_LIKES_deviceNum=" + $filter('uppercase')(vm.queryDeviceNum);
      }
      if (null != vm.queryMachineLicenseId&&vm.queryMachineLicenseId!="") {
        restCallURL += "&search_LIKES_machine.licenseId=" +$filter('uppercase')(vm.queryMachineLicenseId);
      }
      if (null != vm.queryDeviceType&&vm.queryDeviceType != ""){
        if(null != vm.queryDeviceType2&&vm.queryDeviceType2 != "") {
          restCallURL += "&search_INSTRING_versionNum=" + $filter('uppercase')(vm.queryDeviceType2);
        } else {
          restCallURL += "&search_LIKE_machine.machineType=" + $filter('uppercase')(vm.queryDeviceType);
        }
      }
      if(null != vm.queryOrg&&vm.querySubOrg){
        restCallURL += "&parentOrgId=" +vm.queryOrg.id;
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
      vm.queryDeviceType = null;
      vm.queryDeviceType2 = null;
      vm.querySubOrg = true;
      vm.queryLinkage = false;
    }

    //组织树的显示
   vm.openTreeInfo=function() {
     treeFactory.treeShow(function (selectedItem) {
       vm.queryOrg =selectedItem;
     });
   }


    vm.validateOperPermission=function(){
      return permissions.getPermissions("device:monitorPage");
    }

    //导出至Excel
    vm.excelExport=function (queryOrg) {

      if (queryOrg) {
        var filterTerm = "id=" + queryOrg.id;
        var restCallURL = DEVCEMONITOR_EXCELEXPORT;
        if (filterTerm){
          restCallURL += "?";
          restCallURL += filterTerm;
        }
        if(vm.querySubOrg) {
          restCallURL += "&parentOrgId="+ queryOrg.id;
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
            download: queryOrg.label +'.xls'
          })[0].click();

        }).error(function (data, status, headers, config) {
          Notification.error("下载失败!");
        });
      }else {
          Notification.error("请选择需要导出的组织!");
      }

    };

    vm.selectChange = function(selectCon) {
      if(selectCon == "挖掘机") {
        vm.queryLinkage = true;
      } else {
        vm.queryLinkage = false;
        vm.queryDeviceType2 = null;
      }
    }
  }
})();
