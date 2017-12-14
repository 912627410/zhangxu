/**
 * Created by xielongwang on 2017/7/20.
 */
(function () {

  angular
    .module('GPSCloud')
    .controller('rentalPlatformController', rentalPlatformController);

  /** @ngInject */
  function rentalPlatformController($rootScope, $cookies, $scope, $translate, $stateParams, $stateParams, $state, languages) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    var orgTenantType = $rootScope.userInfo.userdto.organizationDto.tenantType;
    //如果用户为空进入登录页面
    if (userInfo == null) {
      $rootScope.$state.go("entry");
      return;
    }

    $scope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
      if (fromState.name == 'selectApp' && toState.name == 'rental') {
        $rootScope.$state.go("rental");
        return;
      }
    });

    //验证用户类别
    if (orgTenantType == null || orgTenantType == ''||orgTenantType == '1' ) {
      $rootScope.$state.go('home');
      return;
    } else {
      var orgTypes = orgTenantType.split(",");
      if (orgTypes.length >= 2) {
        //如果多种类型的用户,给出选择框进入系统
        $rootScope.$state.go('selectApp');
        return;
      }
    }


  }

})();
