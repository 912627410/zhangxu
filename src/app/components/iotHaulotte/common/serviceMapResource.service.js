/**
 * Created by 刘鲁振 on 2018/1/21.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('serviceMapResource', serviceMapResource);

  /** @ngInject */

  function serviceMapResource($filter,$q,$rootScope,$resource,HOME_GOOGLEMAPGPSDATA_URL,Notification) {

    var restCallService = function (URL, action, params) {
      var restCall = $resource(URL);

      var defer = $q.defer();
      var succCallback = function (data) {
        defer.resolve(data);
      };
      var failCallback = function (data) {
        defer.reject(data);
      };
      if (action == "GET") {
        restCall.get(succCallback, failCallback);
      }
      //如果返回json是array的话需要用query，否则用get
      if (action == "QUERY") {
        restCall.query(succCallback, failCallback);
      }
      //POST
      if (action == "ADD") {
        restCall.save(params, succCallback, failCallback);
      }
      //PUT
      if (action == "UPDATE") {
        var restUpdateCall = $resource(URL, {}, {'update': {method: 'PUT'}});
        restUpdateCall.update(params, succCallback, failCallback);

      }


      return defer.promise
    };
    return {

      //查询设备数据更新到google地图
      refreshHaulotteGoogleMapWithDeviceInfo: function () {
        //中心点和默认缩放比例  2.338154,48.927463
        var map = {
          center: {latitude: 48.927463, longitude: 2.338154},
          zoom: 5,
          options: {scrollwheel: false, scaleControl: true},
          markers: []
        };
        if ($rootScope.userInfo) {
          var rspdata = restCallService(HOME_GOOGLEMAPGPSDATA_URL + "?size=3000&search_EQ_locateStatus=1", "QUERY");
          rspdata.then(function (deviceGPSInfoList) {
            deviceGPSInfoList.forEach(function (deviceGPSInfo, index, array) {
              if (deviceGPSInfo != null && deviceGPSInfo.latitudeNum != null && deviceGPSInfo.longitudeNum != null) {
                //map.center.latitude=deviceGPSInfo.amaplatitudeNum;
                //map.center.longitude=deviceGPSInfo.amaplongitudeNum;
                map.markers.push({
                  id: index,
                  latitude: deviceGPSInfo.latitudeNum,
                  longitude: deviceGPSInfo.longitudeNum,
                  show: false,
                  deviceNum: deviceGPSInfo.deviceNum,
                  lastDataUploadTime: deviceGPSInfo.lastDataUploadTime == null ? '' : $filter('date')(deviceGPSInfo.lastDataUploadTime, 'yyyy-MM-dd HH:mm:ss'),
                  //totalDuration: deviceGPSInfo.workDuration == null ? '' : $filter('number')(deviceGPSInfo.workDuration, 2),
                  address: deviceGPSInfo.address
                })
              }
            })
          }, function (reason) {
            Notification.error('获取设备信息失败');
          })
        }

        return map;
      }
    }

  }
})();
