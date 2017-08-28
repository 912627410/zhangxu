(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('selectAppController', selectAppController);

  /** @ngInject */
  function selectAppController($rootScope, $cookies, $scope, $state, $stateParams) {
    var vm = this;

    var userInfo = $rootScope.userInfo;
    //如果用户为空进入登录页面
    if (userInfo == null || userInfo.tenantType==null) {
      $rootScope.$state.go("entry");
    }

    //验证用户类别
    if (userInfo.tenantType != null && userInfo.tenantType != '' && userInfo.tenantType!=undefined) {
      var userTypes = userInfo.tenantType.split(",");

      if (userTypes.length >= 2) {
        //如果多种类型的用户,给出选择框进入系统
        $rootScope.$state.go('selectApp');
      }
      //增加判断是不是租赁平台的用户,如果是直接转到租赁的页面.1:代表物联网用户,2代表租赁用户如果有拥有多种类型中间逗号隔开.例如1,2既是物联网用户又是租赁用户
      if (userInfo.tenantType == '1' || userInfo.tenantType == null ||userInfo.tenantType == '') {
        //直接转入到租赁页面
        $rootScope.$state.go('home');
      }
      //增加判断是不是租赁平台的用户,如果是直接转到租赁的页面.1:代表物联网用户,2代表租赁用户如果有拥有多种类型中间逗号隔开.例如1,2既是物联网用户又是租赁用户
      if (userInfo.tenantType == '2') {
        //直接转入到租赁页面
        $rootScope.$state.go('rental');
      }
    }

    vm.selectRental = function () {
      $rootScope.$state.go('rental');

    }

    vm.selectIot = function () {
      $rootScope.$state.go('home');
    }


  }

})();
