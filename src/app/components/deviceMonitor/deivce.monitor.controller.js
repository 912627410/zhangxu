/**
 * Created by shuangshan on 16/1/6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */

  function DeviceMonitorController($rootScope, $scope,$http, $uibModal, $timeout, $filter, permissions,$translate,languages,treeFactory,NgTableParams, ngTableDefaults, DEVCE_MONITOR_SINGL_QUERY, DEVCE_MONITOR_PAGED_QUERY,
                                   DEVCE_HIGHTTYPE,DEVCE_MF,DEVCE_POWERTYPE,
                                   DEFAULT_DEVICE_SORT_BY, DEFAULT_SIZE_PER_PAGE, AMAP_QUERY_TIMEOUT_MS, serviceResource, Notification,DEVCEMONITOR_EXCELEXPORT,uiGmapGoogleMapApi) {
    var vm = this;

    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    var userInfo = $rootScope.userInfo;
    vm.querySubOrg = true;

    vm.refreshMainMap = function (deviceList) {
      $timeout(function () {
        if($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH"){
          vm.map = serviceResource.refreshGoogleMapWithDeviceInfo();
        }else{
          serviceResource.refreshMapWithDeviceInfo("monitorMap", deviceList,3);
        }
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


    //TODO 暂时停用，后续可能会使用   by yalong.shang 2017-06-21
    //读取参数信息
    /*vm.getMFList = function() {
      var search = DEVCE_MF;
      var page = search.page||0;
      var size = search.size||100;
      var sort = search.sort||'id,desc';
      var finalURL = search + "?page=" + page  + '&size=' + size + '&sort=' + sort + '&search_EQ_status=1';
      var rspData = serviceResource.restCallService(finalURL, "GET");
      rspData.then(function(data){
        vm.deviceManufactureList = data.content;
      },function(reason){
        Notification.error("读取生产厂家出错");
      });
    };

    vm.getPowerTypeList = function() {
      var search = DEVCE_POWERTYPE;
      var page = search.page||0;
      var size = search.size||100;
      var sort = search.sort||'id,desc';
      var finalURL = search + "?page=" + page  + '&size=' + size + '&sort=' + sort + '&search_EQ_status=1';
      var rspData = serviceResource.restCallService(finalURL, "GET");
      rspData.then(function(data){
        vm.devicePowerTypeList = data.content;
      },function(reason){
        Notification.error("读取驱动类型出错");
      });
    };

    vm.getHeightTypeList = function() {
      var search = DEVCE_HIGHTTYPE;
      var page = search.page||0;
      var size = search.size||40;
      var sort = search.sort||'id,desc';
      var finalURL = search+ "?page=" + page  + '&size=' + size + '&sort=' + sort + '&search_EQ_status=1';

    //  alert(finalURL);
      var rspData = serviceResource.restCallService(finalURL, "GET");
      rspData.then(function(data){
        vm.deviceHeightTypeList = data.content;
      },function(reason){
        Notification.error("读取高度类型出错");
      });
    };*/



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
        restCallURL += "&search_INSTRING_versionNum=" + $filter('uppercase')(vm.queryDeviceType);
      }

      if (null != vm.queryManufacture&&vm.queryManufacture!="") {
        restCallURL += "&search_EQ_deviceManufacture.id=" +$filter('uppercase')(vm.queryManufacture);
      }
      if (null != vm.queryDevicePowerType&&vm.queryDevicePowerType!="") {
        restCallURL += "&search_EQ_devicePowerType.id=" +$filter('uppercase')(vm.queryDevicePowerType);
      }
      if (null != vm.queryDeviceHeightType&&vm.queryDeviceHeightType!="") {
        restCallURL += "&search_EQ_deviceHeightType.id=" +$filter('uppercase')(vm.queryDeviceHeightType);
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
      $rootScope.$state.go('login');
    }
    else {
      if($rootScope.userInfo.userdto.countryCode== "ZH"){
        vm.queryDeviceInfo(0, null, null, null);
      }

       // vm.getMFList();
       // vm.getPowerTypeList();
       // vm.getHeightTypeList();
    }
    uiGmapGoogleMapApi.then(function(maps) {
      console.log("init google map success");
    });
    if ($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH") {
      vm.map = serviceResource.refreshGoogleMapWithDeviceInfo();
      vm.queryDeviceInfo(0, null, null, null);
    }

    //监控
    vm.currentInfo = function (id, size) {

      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfoMonitor = data.content;
          var templateUrl, controller;
        //判读是否是高空车
        if(vm.deviceinfoMonitor.versionNum == 'A001'||vm.deviceinfoMonitor.versionNum == '11') {
          templateUrl = 'app/components/deviceMonitor/deviceAerialCurrentInfo.html';
          controller = 'deviceAerialCurrentInfoController as deviceAerialCurrentInfoController';
          size = 'super-lgs';
        } else {
          templateUrl = 'app/components/deviceMonitor/devicecurrentinfo.html';
          controller = 'DeviceCurrentInfoController as deviceCurrentInfoCtrl';
        }
        $rootScope.currentOpenModal = $uibModal.open({
          animation: vm.animationsEnabled,
          backdrop: false,
          templateUrl: templateUrl,
          controller: controller,
          size: size,
          //windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
          //size: 'super-lgs',
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

      vm.queryManufacture = null;
      vm.queryDeviceHeightType = null;
      vm.queryDevicePowerType = null;

      vm.querySubOrg = true;
    }

    //组织树的显示
   vm.openTreeInfo=function() {
     treeFactory.treeShow(function (selectedItem) {
       vm.queryOrg =selectedItem;
     });
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

          //兼容多种浏览器
          if (window.navigator.msSaveBlob) { // IE
            window.navigator.msSaveOrOpenBlob(blob, queryOrg.label +'.xls')
          } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
            anchor.css({display: 'none'});
            angular.element(document.body).append(anchor);
            anchor.attr({
              href: URL.createObjectURL(blob),
              target: '_blank',
              download: queryOrg.label +'.xls'
            })[0].click();
            anchor.remove();
          } else { // Chrome
            anchor.attr({
              href: URL.createObjectURL(blob),
              target: '_blank',
              download: queryOrg.label +'.xls'
            })[0].click();
          }


        }).error(function (data, status, headers, config) {
          Notification.error(languages.findKey('failedToDownload'));
        });
      }else {
          Notification.error(languages.findKey('selectTheOrganizationToExport'));
      }

    }
  }
})();
