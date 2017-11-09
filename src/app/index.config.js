(function() {
  'use strict';

  var GPSCloudConfig = angular.module('GPSCloud');


    GPSCloudConfig.config(config);

  /** @ngInject */
  function config($logProvider, $httpProvider,toastrConfig,IdleProvider, KeepaliveProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    //树状列表配置
    /* Register error provider that shows message on failed requests or redirects to login page on
     * unauthenticated requests */
    $httpProvider.interceptors.push(function ($q, $rootScope,$window) {
        return {
          'responseError': function(rejection) {
            var status = rejection.status;
            var config = rejection.config;
            var method = config.method;
            var url = config.url;

            if (status == 401) {
              $rootScope.userInfo = null;
              $rootScope.deviceGPSInfo = null;
              $rootScope.statisticInfo = null;
              $rootScope.permissionList = null;


              $window.sessionStorage.removeItem("userInfo");
              $window.sessionStorage.removeItem("deviceGPSInfo");
              $window.sessionStorage.removeItem("statisticInfo");
              $window.sessionStorage.removeItem("permissionList");

              $rootScope.$state.go( "login" );
            } else {
              $rootScope.error = method + " on " + url + " failed with status " + status;
            }
            return $q.reject(rejection);
          }
        };
      }
    );

    /* Registers auth token interceptor, auth token is either passed by header or by query parameter
     * as soon as there is an authenticated user */
    $httpProvider.interceptors.push(function ($q, $rootScope) {
      return {
        'request': function(config) {
          var isRestCall = config.url.indexOf('rest') != 0;
          if (isRestCall && $rootScope.userInfo && $rootScope.userInfo.authtoken) {
            var authToken = $rootScope.userInfo.authtoken;
      //      config.headers['Authorization'] = authToken;

            config.headers['token'] = $rootScope.userInfo.authtoken;
          }


          return config || $q.when(config);
        }
      };
    });

    //$httpProvider.defaults.transformResponse = function(data, headersGetter, status) {
    //
    //
    //};

// configure Idle settings
    //idle(seconds) (integer, default is 20min): The idle timeout duration in seconds.
    // After this amount of time passes without the user performing an action that triggers one of the watched DOM events, the user is considered idle.
    // Note: Prior to v1.0, this method is called idleDuratio
    IdleProvider.idle(20 * 60); // in seconds

    //timeout(seconds) (integer, default is 30s): The amount of time the user has to respond (in seconds) before they have been considered timed out. Set to 0 or false to disable this feature, if you want Idle to nothing but detect when a user is idle or not forever. Note: Prior to v1.0, this method is called warningDuration, and could not be disabled;
    //it always had to have a positive integer value.
    IdleProvider.timeout(60); // in seconds


    //interval(seconds) (integer, default is 10 minutes): Must be greater than 0.
    //This specifies how often the Keepalive event is triggered and the HTTP request is issued.
    //KeepaliveProvider.interval(10); // in seconds

  }

  GPSCloudConfig.config(['$translateProvider', function ($translateProvider) {

  // configures staticFilesLoader
    $translateProvider.useStaticFilesLoader({
      prefix: 'locale-',
      suffix: '.json'
    });

    var language_en_us = "en-us";
		var language_zh_cn = "zh-cn";
	  var currentLang;
	  var current_lang_map;
	  currentLang = navigator.language;
	  if(!currentLang){
	  	 currentLang = navigator.browserLanguage;
	  }
	  if(currentLang.toLowerCase() == language_zh_cn)  {
		    current_lang_map = 'zh';
		}else {
		    current_lang_map = 'en';
		}

   // load 'en' table on startup
    $translateProvider.preferredLanguage(current_lang_map);

  }]);

})();
