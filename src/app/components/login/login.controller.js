/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($rootScope, $window,Notification,serviceResource) {
    var vm = this;
    var userInfo;
    vm.loginMe = function(){
      var rspPromise = serviceResource.authenticate(vm.credentials);
      rspPromise.then(function(data){
        var userInfo = {
          authtoken: data.authtoken,
          userdto: data.userinfo
        };
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        Notification.success('登录成功');
        $rootScope.$state.go('home');
      },function(reason){
        $rootScope.userInfo = null;
        $window.sessionStorage["userInfo"] = null;
        Notification.error('用户名或密码错误');
      });
    };
  }
})();
