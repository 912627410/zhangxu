/* global malarkey:false, moment:false */
(function() {
  'use strict';
  var SERVER_BASE_URL = 'http://127.0.0.1:8080/rest/';
  angular
    .module('GPSCloud')
    .constant('malarkey', malarkey)
    .constant('moment', moment)
    .constant('DEFAULT_SIZE_PER_PAGE', 40)
    .constant('DEFAULT_DEVICE_SORT_BY', 'deviceNum,desc')
    .constant('AMAP_URL', 'http://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&callback=init')
    .constant('AMAP_GEO_CODER_URL', 'http://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Geocoder')
    .constant('SERVER_BASE_URL', SERVER_BASE_URL)
    .constant('USER_LOGIN_URL', SERVER_BASE_URL + 'user/gettoken')
    .constant('USER_REGISTER_URL', SERVER_BASE_URL + 'user/register')
    .constant('HOME_GPSDATA_URL', SERVER_BASE_URL + 'device/homegpsdata')
    .constant('HOME_STATISTICS_DATA_URL', SERVER_BASE_URL + 'device/homedata')
    .constant('DEVCE_PAGED_QUERY', SERVER_BASE_URL + 'device/deviceinfopage')

  ;

})();
