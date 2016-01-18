/* global malarkey:false, moment:false */
(function() {
  'use strict';
  var SERVER_BASE_URL = 'http://127.0.0.1:8080/rest/';
  angular
    .module('GPSCloud')
    .constant('malarkey', malarkey)
    .constant('moment', moment)
    .constant('DEFAULT_SIZE_PER_PAGE', 40)    //默认每页显示纪录数
    .constant('AMAP_QUERY_TIMEOUT_MS', 3000)  //高德地图api调用延时毫秒数
    .constant('DEFAULT_DEVICE_SORT_BY', 'deviceNum,desc')    //读取设备时的默认排序规则
    .constant('DEFAULT_DEVICE_DATA_SORT_BY', 'recordTime,desc')    //读取设备数据时的默认排序规则
    .constant('DEFAULT_DEVICE_WARNING_DATA_SORT_BY', 'warningTime,desc')    //读取设备报警数据时的默认排序规则

    .constant('AMAP_URL', 'http://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&callback=init')   //高德地图URL
    .constant('AMAP_GEO_CODER_URL', 'http://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Geocoder')
    .constant('SERVER_BASE_URL', SERVER_BASE_URL)
    .constant('USER_LOGIN_URL', SERVER_BASE_URL + 'user/gettoken')
    .constant('USER_REGISTER_URL', SERVER_BASE_URL + 'user/register')
    .constant('HOME_GPSDATA_URL', SERVER_BASE_URL + 'device/homegpsdata')       //主页中地图数据
    .constant('HOME_STATISTICS_DATA_URL', SERVER_BASE_URL + 'device/homedata')  //主页的统计数据URL
    .constant('DEVCE_PAGED_QUERY', SERVER_BASE_URL + 'device/deviceinfopage')   //分页查询设备信息URL
    .constant('DEVCE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicedata')   //分页查询设备数据URL
    .constant('DEVCE_WARNING_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/warningdata')   //分页查询设备报警数据URL

  ;

})();
