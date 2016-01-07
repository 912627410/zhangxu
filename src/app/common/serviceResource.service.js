/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('serviceResource', serviceResource);

  /** @ngInject */
  function serviceResource($rootScope,$resource,$http,$q,$window,TipService,USER_LOGIN_URL,
                           AMAP_URL,HOME_GPSDATA_URL,DEVCE_PAGED_QUERY,DEFAULT_SIZE_PER_PAGE,
                           DEFAULT_DEVICE_SORT_BY,AMAP_GEO_CODER_URL) {
    var restCallService = function(URL,action){
      var loginCall = $resource(URL);
      var defer = $q.defer();
      var succCallback = function(data){
        defer.resolve(data);
      };
      var failCallback = function(data){
        defer.reject(data);
      };
      if (action == "GET"){
        loginCall.get(succCallback,failCallback);
      }
      //如果返回json是array的话需要用query，否则用get
      if (action == "QUERY"){
        loginCall.query(succCallback,failCallback);
      }
      return defer.promise
    };
    return {
      restCallService:restCallService,
      //高德地图逆向地理编码(坐标->地址)
      getAddressFromXY: function(lnglatXY,callback){
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          var geocoder = new AMap.Geocoder();
          geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
              callback(result.regeocode.formattedAddress);
            }
          });
        })
      },
      //mapid 是DOM中地图放置位置的id
      refreshMapWithDeviceInfo: function (mapId) {
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          if (!AMap) {
            location.reload(false);
          }
          var map = new AMap.Map(mapId, {
            resizeEnable: true,
            zooms: [5, 18]
          });
          map.setZoom(1);
          map.plugin(['AMap.ToolBar'], function () {
            map.addControl(new AMap.ToolBar());
          });
          //读取所有设备的gps信息，home map使用
          if ($rootScope.userInfo) {
            var rspdata = restCallService(HOME_GPSDATA_URL, "QUERY");
            rspdata.then(function (data) {
              var deviceGPSInfo = data;
              for (var i = 0; i < deviceGPSInfo.length; i++) {
                if (deviceGPSInfo[i].latitudeNum != null) {
                  var latitude = deviceGPSInfo[i].latitudeNum;     //纬度
                }
                if (deviceGPSInfo[i].longitudeNum != null) {
                  var longitude = deviceGPSInfo[i].longitudeNum;   //经度
                }
                if (latitude != null && longitude != null) {
                  var marker = new AMap.Marker({
                    icon: "http://webapi.amap.com/images/marker_sprite.png",
                    position: [longitude, latitude]
                  });
                  marker.setMap(map);
                }
              }
            }, function (reason) {
              map.clearMap();
              TipService.setMessage('获取设备信息失败', 'error');
            })
          }
        })
      },
      //登录认证接口
      authenticate:function(credentials){
        var cred = "Basic "+ btoa(credentials.username+":"+credentials.password);
        var headers = credentials?{authorization:cred}:{};
        $http.defaults.headers.common['Authorization'] = cred;
        var rspPromise = restCallService(USER_LOGIN_URL,'GET');
        return rspPromise;
      },
      queryDeviceInfo:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },

    }
  }

})();
