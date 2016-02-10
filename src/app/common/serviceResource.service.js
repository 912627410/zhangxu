/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('serviceResource', serviceResource);

  /** @ngInject */
  function serviceResource($rootScope,$resource,$http,$q,$window,Notification,USER_LOGIN_URL,NOTIFICATION_STATISTICS_URL,
                           AMAP_URL,HOME_GPSDATA_URL,DEVCE_PAGED_QUERY,DEFAULT_SIZE_PER_PAGE,DEVCE_DATA_PAGED_QUERY,DEVCE_SIMPLE_DATA_PAGED_QUERY,
                           NOTIFICATION_PAGED_URL,USER_PAGED_URL,DEVCE_WARNING_DATA_PAGED_QUERY,DEFAULT_USER_SORT_BY,DEFAULT_NOTIFICATION_SORT_BY,
                           DEFAULT_DEVICE_SORT_BY,DEFAULT_DEVICE_DATA_SORT_BY,DEFAULT_DEVICE_WARNING_DATA_SORT_BY,AMAP_GEO_CODER_URL) {
    var restCallService = function(URL,action,params){
      var restCall = $resource(URL);
      var defer = $q.defer();
      var succCallback = function(data){
        defer.resolve(data);
      };
      var failCallback = function(data){
        defer.reject(data);
      };
      if (action == "GET"){
        restCall.get(succCallback,failCallback);
      }
      //如果返回json是array的话需要用query，否则用get
      if (action == "QUERY"){
        restCall.query(succCallback,failCallback);
      }
      //POST
      if (action == "ADD"){
        restCall.save(params,succCallback,failCallback);
      }
      //PUT
      if (action == "UPDATE"){
        var restUpdateCall = $resource(URL,{},{'update': { method:'PUT' }});
        restUpdateCall.update(params,succCallback,failCallback);

      }
      return defer.promise
    };
    return {
      restCallService:restCallService,
      refreshUserAuthtoken:function(newpassword){
        $rootScope.userInfo.authtoken ="Basic "+ btoa($rootScope.userInfo.userdto.ssn+":"+newpassword);
        $window.sessionStorage["userInfo"] = JSON.stringify($rootScope.userInfo);
      },
      //高德地图逆向地理编码(坐标->地址)
      getAddressFromXY: function(lnglatXY,callback){
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          var geocoder = new AMap.Geocoder();
          geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
              callback(result.regeocode.formattedAddress);
            }
            else{
              //如果请求失败则把地址设置为'--'
              callback('--');
            }
          });
        })
      },
      //查询设备数据并更新地图 mapid 是DOM中地图放置位置的id
      refreshMapWithDeviceInfo: function (mapId,deviceList) {
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          if (!AMap) {
            location.reload(false);
          }
          var map = new AMap.Map(mapId, {
            resizeEnable: true,
            center: [103.39,36.9],   //设置中心点大概在兰州附近
            zooms: [5, 18]
          });
          map.setZoom(1);
          map.plugin(['AMap.ToolBar'], function () {
            map.addControl(new AMap.ToolBar());
          });
          //读取所有设备的gps信息，home map使用
          if ($rootScope.userInfo ) {
            if(deviceList == null){
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
                Notification.error('获取设备信息失败');
              })
            }
            else{
              deviceList.forEach(function(deviceInfo){
                if (deviceInfo.locateStatus === 'A' && deviceInfo.longitudeNum != null && deviceInfo.latitudeNum != null) {
                  var marker = new AMap.Marker({
                    icon: "http://webapi.amap.com/images/marker_sprite.png",
                    position: [deviceInfo.longitudeNum, deviceInfo.latitudeNum]
                  });
                  marker.setMap(map);
                }
              })
            }
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
      //分页查询设备信息(device info)
      queryDeviceInfo:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询设备数据信息(device data)
      queryDeviceData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询设备数据简化信息(device simple data)
      queryDeviceSimpleData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_SIMPLE_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询设备报警数据信息(device warning data)
      queryDeviceWarningData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_WARNING_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_WARNING_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询用户信息(user info)
      queryUserInfo:function(page,size,sort,queryCondition){
        var restCallURL = USER_PAGED_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_USER_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询用户提醒信息(notification info)
      queryNotification:function(page,size,sort,queryCondition){
        var restCallURL = NOTIFICATION_PAGED_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_NOTIFICATION_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //查询用户提醒信息统计数据()
      queryNotificationStatistics:function(){
        var restCallURL = NOTIFICATION_STATISTICS_URL;
        return restCallService(restCallURL,"QUERY");
      },
      //修改数据通用接口
      restUpdateRequest:function(URL,params){
        return restCallService(URL,"UPDATE",params);
      },

      //添加数据通用接口
      restAddRequest:function(URL,params){
        return restCallService(URL,"ADD",params);
      },

      //TODO
      getWarningMsg:function(deviceWarningData){
        return "[SPN:" + deviceWarningData.spn + "] [FMI:"+ deviceWarningData.fmi +"] [CM:"+ deviceWarningData.cm + "] [OC:"+ deviceWarningData.oc +"]";
      }

    }
  }

})();
