/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($rootScope, $window,$http,TipService,serviceResource) {
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
        $rootScope.$state.go('home');
        TipService.setMessage('登录成功', 'success');
      },function(reason){
        $rootScope.userInfo = null;
        $window.sessionStorage["userInfo"] = null;
        TipService.setMessage('用户名或密码错误', 'error');
      });
    };
  }
})();
