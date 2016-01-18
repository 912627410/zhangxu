/**
 * Created by shuangshan on 16/1/6.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */
  function DeviceMonitorController($rootScope,$scope,$uibModal,$timeout,DEVCE_PAGED_QUERY,AMAP_QUERY_TIMEOUT_MS,serviceResource,Notification) {
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
    vm.refreshDOM = function() {
      setTimeout(function(){
        $scope.$apply();
      }, AMAP_QUERY_TIMEOUT_MS);
    };

    vm.queryDeviceInfo = function(page,size,sort,queryCondition){
      if (queryCondition){
        var filterTerm = "filter=" + queryCondition;
      }
      var deviceDataPromis = serviceResource.queryDeviceInfo(page, size, sort, filterTerm);
      deviceDataPromis.then(function (data) {
          vm.deviceInfoList = data.content;
          vm.page = data.page;
          vm.deviceData_pagenumber = data.page.number + 1;
          vm.basePath = DEVCE_PAGED_QUERY;
          //地图数据
          vm.refreshMainMap(vm.deviceInfoList);

          vm.deviceInfoList.forEach(function (deviceInfo) {
            var lnglatXY = [parseFloat(deviceInfo.longitudeNum), parseFloat(deviceInfo.latitudeNum)];
            serviceResource.getAddressFromXY(lnglatXY, function (newaddress) {
              deviceInfo.address = newaddress;
            })
          })
        }, function (reason) {
          Notification.error('获取设备信息失败');
        }
      )
      vm.refreshDOM();
    }

    if (userInfo == null){
      $rootScope.$state.go('home.login');
    }
    else{
      vm.queryDeviceInfo(0,null,null,null);
    }

//监控
    vm.currentInfo = function (deviceinfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        backdrop: false,
        templateUrl: 'app/components/deviceMonitor/devicecurrentinfo.html',
        controller: 'DeviceCurrentInfoController as deviceCurrentInfoCtrl',
        size: size,
        resolve: { //用来向controller传数据
          deviceinfo: function () {
            return deviceinfo;
          }
        }
      });
    };

  }
})();
