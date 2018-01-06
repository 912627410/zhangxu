/**
 * Created by shuangshan on 16/1/6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */

  function DeviceMonitorController($rootScope, $scope, $http, $uibModal, $timeout, $filter, permissions, $translate, languages, treeFactory, NgTableParams, ngTableDefaults, DEVCE_MONITOR_SINGL_QUERY, LX_DEVCE_MONITOR_SINGL_QUERY, DEVCE_MONITOR_PAGED_QUERY, DEFAULT_DEVICE_SORT_BY, DEFAULT_SIZE_PER_PAGE, AMAP_QUERY_TIMEOUT_MS, serviceResource, Notification, DEVCEMONITOR_EXCELEXPORT) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.animationsEnabled = true;
    vm.querySubOrg = true;
    vm.queryLinkage = false;
    vm.radioListType = "list";
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    if (userInfo == null) {
      $rootScope.$state.go('login');
    }

    /**
     * 刷新地图
     * @param deviceList
     */
    vm.refreshMainMap = function (deviceList) {
      $timeout(function () {
        serviceResource.refreshMapWithDeviceInfo("monitorMap", deviceList, 4);
      })
    }

    /**
     * 默认地址
     */
    vm.setDefaultAddress = function () {
      if (vm.deviceInfoList != null) {
        vm.deviceInfoList.forEach(function (deviceInfo) {
          if (deviceInfo.address === languages.findKey('requestingLocationData') + '...') {
            deviceInfo.address = '--';
          }
        })
      }
    }

    /**
     * 查询
     * @param page 页
     * @param size 大小
     * @param sort 排序
     * @param deviceinfo deviceinfo
     */
    vm.queryDeviceInfo = function (page, size, sort, deviceinfo) {
      var restCallURL = DEVCE_MONITOR_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if (null != vm.queryOrg && null != vm.queryOrg.id && !vm.querySubOrg) {
        restCallURL += "&search_EQ_organization.id=" + vm.queryOrg.id;
      }
      if (null != vm.queryDeviceNum && vm.queryDeviceNum != "") {
        restCallURL += "&search_LIKES_deviceNum=" + $filter('uppercase')(vm.queryDeviceNum);
      }
      if (null != vm.queryMachineLicenseId && vm.queryMachineLicenseId != "") {
        restCallURL += "&search_LIKES_machine.licenseId=" + $filter('uppercase')(vm.queryMachineLicenseId);
      }
      if (null != vm.queryDeviceType && vm.queryDeviceType != "") {
        if (null != vm.queryDeviceType2 && vm.queryDeviceType2 != "") {
          restCallURL += "&search_INSTRING_versionNum=" + $filter('uppercase')(vm.queryDeviceType2);
        } else {
          restCallURL += "&search_LIKE_machine.machineType=" + $filter('uppercase')(vm.queryDeviceType);
        }
      }
      if (null != vm.queryOrg && vm.querySubOrg) {
        restCallURL += "&parentOrgId=" + vm.queryOrg.id;
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
          vm.basePath = DEVCE_MONITOR_PAGED_QUERY;
          //地图数据
          vm.refreshMainMap(vm.deviceInfoList);
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    };

    /**
     * 初始化列表
     */
    vm.queryDeviceInfo(0, null, null, null);

    /**
     * 北谷设备的详情展示
     *
     * @param id
     */
    function nvrDeviceInfoShow(id) {
      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfoMonitor = data.content;
          $rootScope.currentOpenModal = $uibModal.open({
            animation: vm.animationsEnabled,
            backdrop: false,
            templateUrl: 'app/components/deviceMonitor/devicecurrentinfo.html',
            controller: 'DeviceCurrentInfoController as deviceCurrentInfoCtrl',
            size: 'super-lgs',
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
    }

    /**
     * 南京理学deviceinfo展示
     *
     * @param id
     */
    function lxDeviceInfShow(id) {
      var singleUrl = LX_DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceInfoPromise = serviceResource.restCallService(singleUrl, "GET");
      deviceInfoPromise.then(function (data) {
          $rootScope.currentOpenModal = $uibModal.open({
            animation: vm.animationsEnabled,
            backdrop: false,
            templateUrl: 'app/components/deviceMonitor/lxDeviceCurrentInfo.html',
            controller: 'lxDeviceCurrentInfoController as vm',
            size: 'super-lgs',
            resolve: { //用来向controller传数据
              lxDeviceInfo: function () {
                return data.content;
              }
            }
          });

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    }

    /**
     * 设备监控页面
     * @param id deviceInfo的id
     */
    vm.currentInfo = function (deviceinfo) {
      if (deviceinfo.versionNum != null && deviceinfo.versionNum != undefined && deviceinfo.versionNum === 'lx01') {
        lxDeviceInfShow(deviceinfo.id);
        return;
      }
      nvrDeviceInfoShow(deviceinfo.id);
    };

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.queryDeviceNum = null;
      vm.queryMachineLicenseId = null;
      vm.queryOrg = null;
      vm.queryDeviceType = null;
      vm.queryDeviceType2 = null;
      vm.querySubOrg = true;
      vm.queryLinkage = false;
    }

    /**
     * 组织树的显示
     */
    vm.openTreeInfo = function () {
      treeFactory.treeShow(function (selectedItem) {
        vm.queryOrg = selectedItem;
      });
    }

    /**
     * 是否有设备监控的权限
     * @returns {*|boolean}
     */
    vm.validateOperPermission = function () {
      return permissions.getPermissions("device:monitorPage");
    }

    /**
     * 导出数据
     * @param queryOrg
     */
    vm.excelExport = function (queryOrg) {

      if (queryOrg) {
        var filterTerm = "id=" + queryOrg.id;
        var restCallURL = DEVCEMONITOR_EXCELEXPORT;
        if (filterTerm) {
          restCallURL += "?";
          restCallURL += filterTerm;
        }
        if (vm.querySubOrg) {
          restCallURL += "&parentOrgId=" + queryOrg.id;
        }

        $http({
          url: restCallURL,
          method: "GET",
          responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {

          var blob = new Blob([data], {type: "application/vnd.ms-excel"});
          var anchor = angular.element('<a/>');
          //兼容多种浏览器
          if (window.navigator.msSaveBlob) { // IE
            window.navigator.msSaveOrOpenBlob(blob, queryOrg.label + '.xls')
          } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox

            anchor.css({display: 'none'});
            angular.element(document.body).append(anchor);


            anchor.attr({
              href: URL.createObjectURL(blob),
              target: '_blank',
              download: queryOrg.label + '.xls'
            })[0].click();

            anchor.remove();
          } else { // Chrome
            anchor.attr({
              href: URL.createObjectURL(blob),
              target: '_blank',
              download: queryOrg.label + '.xls'
            })[0].click();
          }


        }).error(function (data, status, headers, config) {
          Notification.error("下载失败!");
        });
      } else {
        Notification.error("请选择需要导出的组织!");
      }

    };

    /**
     * 选择机型
     * @param selectCon
     */
    vm.selectChange = function (selectCon) {
      if (selectCon == "挖掘机") {
        vm.queryLinkage = true;
      } else {
        vm.queryLinkage = false;
        vm.queryDeviceType2 = null;
      }
    }
  }
})();
