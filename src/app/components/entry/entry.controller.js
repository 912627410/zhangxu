/**
 * Created by zhenyu on 17-5-17.
 */
(function() {
  'use strict';

  angular.module('GPSCloud').controller('entryController', entryController);

  function entryController($rootScope,$scope, $http,$cookies,$filter, $window,Notification, serviceResource, languages) {


    var vm = this;
    var userInfo;
    vm.rememberMe = true;
    $scope.isShow = false;

    $scope.$on('$viewContentLoaded', function(){
      if(null!=$cookies.getObject("user")&&null==$cookies.getObject("outstate")){
        var userobj = {};
        userobj.username = $cookies.getObject("user").username;
        userobj.authtoken = $cookies.getObject("user").authtoken;
        vm.loginBytoken(userobj);
      }else{
        $rootScope.$state.go('home.login');
      }
    });


    vm.loginBytoken = function (userobj) {
      var rspPromise = serviceResource.authenticateb(userobj);
      rspPromise.then(function (response) {
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo
        };
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        if(userInfo.userdto.organizationDto.logo!=null && userInfo.userdto.organizationDto.logo!=""){
          $rootScope.logo="assets/images/"+$rootScope.userInfo.userdto.organizationDto.logo;

        }else{
          $rootScope.logo="assets/images/logo2.png";
        }
        Notification.success(languages.findKey('loginSuccess'));

        vm.getPermission();

      }, function (reason) {
        Notification.error(languages.findKey('loginFailure'));
      });
    };


    vm.getPermission = function (passwordPattenStatus) {
      var rspData = serviceResource.getPermission();
      rspData.then(function (data) {
        var permissionList = $filter("array2obj")(data.content, "permission");
        $rootScope.permissionList = permissionList;
        $window.sessionStorage["permissionList"] = JSON.stringify(permissionList);

        $rootScope.$state.go('home');

      }, function (reason) {
      });
    }

  }

})();
