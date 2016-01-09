/**
 * Created by shuangshan on 1/9/16.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($rootScope, $window,USER_REGISTER_URL,TipService,serviceResource) {
    var vm = this;
    var userInfo;
    var registerProcess = function(registerInfo, callback){
      var userInfoForRegister = {
        ssn : registerInfo.username,
        password : registerInfo.password,
        email : registerInfo.email,
        mobile : registerInfo.mobile
      };
      var rspData = serviceResource.restCallService(USER_REGISTER_URL,'ADD',userInfoForRegister);
      rspData.then(function(data){
        userInfo = {
          authtoken: data.authtoken,
          userdto: data.userinfo
        };
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        callback && callback();
      },function(reason){
        $rootScope.userInfo = null;
        $window.sessionStorage["userInfo"] = null;
        callback && callback();
      });
    };
    vm.registerMe = function() {
      registerProcess(vm.registerInfo, function(){
        if (userInfo){
          TipService.setMessage('注册成功', 'success');
          $rootScope.$state.go('home');
        }
        else{
          TipService.setMessage('注册失败', 'success');
        }
      })
    }

  }
})();
