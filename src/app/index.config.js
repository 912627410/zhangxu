(function () {
  'use strict';

  var GPSCloudConfig = angular.module('GPSCloud');


  GPSCloudConfig.config(config);

  /** @ngInject */
  function config($httpProvider, toastrConfig, IdleProvider, KeepaliveProvider) {
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    /**
     * 如果返回401会跳转到登录页面 angular 拦截器
     */
    $httpProvider.interceptors.push(function ($q, $rootScope, $window) {
        return {
          'responseError': function (rejection) {
            var status = rejection.status;
            var config = rejection.config;
            var method = config.method;
            var url = config.url;
            if (status === 401) {
              $rootScope.userInfo = null;
              $rootScope.deviceGPSInfo = null;
              $rootScope.statisticInfo = null;
              $rootScope.permissionList = null;
              $window.sessionStorage.removeItem("userInfo");
              $window.sessionStorage.removeItem("deviceGPSInfo");
              $window.sessionStorage.removeItem("statisticInfo");
              $window.sessionStorage.removeItem("permissionList");
              $rootScope.$state.go("login");
            } else {
              $rootScope.error = method + " on " + url + " failed with status " + status;
            }
            return $q.reject(rejection);
          }
        };
      }
    );

    /**
     * Registers auth token interceptor
     */
    $httpProvider.interceptors.push(function ($q, $rootScope) {
      return {
        'request': function (config) {
          var isRestCall = config.url.indexOf('rest') != 0;
          if (isRestCall && $rootScope.userInfo && $rootScope.userInfo.authtoken) {
            config.headers['token'] = $rootScope.userInfo.authtoken;
          }
          return config || $q.when(config);
        }
      };
    });

    /**
     * 超时时间 seconds
     */
    //IdleProvider.idle(20 * 60);
    IdleProvider.idle(10);

    /**
     * 超时时间倒计时 seconds
     */
    //IdleProvider.timeout(60);
    IdleProvider.timeout(6);

    /**
     * 保鲜机制 seconds
     */
    KeepaliveProvider.interval(10);

  }

  /**
   * 国际化配置
   */
  GPSCloudConfig.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'locale-',
      suffix: '.json'
    });
    var language_en_us = "en-us";
    var language_zh_cn = "zh-cn";
    var currentLang;
    var current_lang_map;
    currentLang = navigator.language;
    if (!currentLang) {
      currentLang = navigator.browserLanguage;
    }
    if (currentLang.toLowerCase() == language_zh_cn) {
      current_lang_map = 'zh';
    } else {
      current_lang_map = 'en';
    }
    $translateProvider.preferredLanguage(current_lang_map);
    $translateProvider.useSanitizeValueStrategy('escape');
  }]);

})();
