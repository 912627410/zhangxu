(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .config(config);

  /** @ngInject */
  function config($logProvider, $httpProvider,toastrConfig) {
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
    $httpProvider.interceptors.push(function ($q, $rootScope) {
        return {
          'responseError': function(rejection) {
            var status = rejection.status;
            var config = rejection.config;
            var method = config.method;
            var url = config.url;

            if (status == 401) {
              $rootScope.$state.go( "/login" );
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
            config.headers['Authorization'] = authToken;
          }
          return config || $q.when(config);
        }
      };
    });

  }

})();
