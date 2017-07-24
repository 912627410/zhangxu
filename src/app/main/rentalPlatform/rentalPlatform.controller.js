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
    if (userInfo.tenantType == null || userInfo.tenantType == ''||userInfo.tenantType == '1' ) {
      $rootScope.$state.go('home');
      return;
    } else {
      var userTypes = userInfo.tenantType.split(",");
      if (userTypes.length >= 2) {
        //如果多种类型的用户,给出选择框进入系统
        $rootScope.$state.go('selectApp');
        return;
      }
    }


  }

})();
