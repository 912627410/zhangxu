/**
 * Created by xielong.wang
 * @description 用于设备监控页面共享deviceinfo数据
 */
(function () {
  'use strict';
  var GPSCloudFactory = angular.module("GPSCloud");
  GPSCloudFactory.factory("sharedDeviceInfoFactory", function ($filter, filterFilter) {
    var sharedDeviceInfo = {};
    /**
     * 设置deviceinfo
     * @param deviceinfo
     */
    sharedDeviceInfo.setSharedDeviceInfo = function (deviceinfo) {
      sharedDeviceInfo = deviceinfo || {};
    };

    sharedDeviceInfo.getSharedDeviceInfo = function () {
      return sharedDeviceInfo;
    }

    return sharedDeviceInfo;
  })
})();

