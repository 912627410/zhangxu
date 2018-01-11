/**
 * Created by yalong on 17-12-8.
 */
(function () {

  angular
    .module('GPSCloud')
    .controller('minemngController', minemngController);

  /** @ngInject */
  function minemngController($rootScope, $cookies, $scope) {
    var vm = this;
    var userInfo = $rootScope.userInfo;

    //如果用户为空进入登录页面
    if (userInfo == null) {
      $rootScope.$state.go("entry");
    }

    $scope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
      if (fromState.name == 'selectApp' && toState.name == 'minemng') {
        $rootScope.$state.go("minemng");
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
      if (userInfo.tenantType == '2') {
        $rootScope.$state.go('rental');
        return;
      }
    }

  }

})();
