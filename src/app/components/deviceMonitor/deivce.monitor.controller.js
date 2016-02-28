/**
 * Created by shuangshan on 16/1/6.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */
  function DeviceMonitorController($rootScope,$scope,$uibModal,$timeout,$filter,DEVCE_MONITOR_SINGL_QUERY,DEVCE_MONITOR_PAGED_QUERY,DEFAULT_DEVICE_SORT_BY,DEFAULT_SIZE_PER_PAGE,AMAP_QUERY_TIMEOUT_MS,serviceResource,Notification) {
    var vm = this;
    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    var userInfo = $rootScope.userInfo;
    vm.refreshMainMap = function(deviceList){
      $timeout(function(){
        serviceResource.refreshMapWithDeviceInfo("monitorMap",deviceList);
      })
    }
    vm.radioListType = "list";
    //这里的延时是因为从高德查询当前位置是异步返回的,如果不延时页面就无法加载正常的数据,延时时间根据网速调整
    //已废弃
    vm.refreshDOM = function() {
      setTimeout(function(){
        vm.setDefaultAddress();
        $scope.$apply();
      }, AMAP_QUERY_TIMEOUT_MS);
    };

    vm.setDefaultAddress = function(){
      if (vm.deviceInfoList != null){
        vm.deviceInfoList.forEach(function (deviceInfo) {
          if (deviceInfo.address === '正在请求定位数据...'){
            deviceInfo.address = '--';
          }
        })
      }
    }

    vm.queryDeviceInfo = function(page,size,sort,deviceinfo){
      //if (queryCondition){
      //  var filterTerm = "search_LIKE_deviceNum=" + $filter('uppercase')(queryCondition);
      //}

      var restCallURL = DEVCE_MONITOR_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != deviceinfo) {

        if (null != deviceinfo.deviceNum) {
          restCallURL += "&search_LIKE_deviceNum=" + $filter('uppercase')(deviceinfo.deviceNum);
        }
        if (null != deviceinfo.machineLicenseId) {
          restCallURL += "&search_LIKE_machine.licenseId=" + deviceinfo.machineLicenseId;
        }

      }

     // var deviceDataPromis = serviceResource.queryDeviceMonitorInfo(page, size, sort, filterTerm);
      var deviceDataPromis = serviceResource.restCallService(restCallURL, "GET");
      deviceDataPromis.then(function (data) {
          vm.deviceInfoList = data.content;
       // console.log(vm.deviceInfoList[0].machine);
          vm.page = data.page;
          vm.deviceData_pagenumber = data.page.number + 1;
          vm.basePath = DEVCE_MONITOR_PAGED_QUERY;
          //地图数据
          vm.refreshMainMap(vm.deviceInfoList);
       }, function (reason) {
          Notification.error('获取设备信息失败');
        }
      )
      //vm.refreshDOM();  改为直接从后台返回
    }

    if (userInfo == null){
      $rootScope.$state.go('home.login');
    }
    else{
      vm.queryDeviceInfo(0,null,null,null);
    }

//监控
    vm.currentInfo = function (id,size) {


     var singlUrl=DEVCE_MONITOR_SINGL_QUERY+"?id="+id;

      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfoMonitor  = data.content;
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
          Notification.error('获取设备信息失败');
        }
      )


    };


    vm.reset = function () {
      vm.device.deviceNum = null;
      vm.device.machineLicenseId = null;
    }

  }
})();
