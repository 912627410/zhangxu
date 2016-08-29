/**
 * Created by worker on 16/2/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('dataAnalysisController', dataAnalysisController);

  /** @ngInject */
  function dataAnalysisController($rootScope,$scope, $sce,$window,$timeout, $state ,$stateParams,serviceResource,Notification,languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.reqAuthtoken = vm.operatorInfo.authtoken;
    vm.menuType = $stateParams.menuType;
    vm.role=$stateParams.role;

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }

    var reqUrl = "http://218.56.128.30:16805/LinGongMachineProfile/lg/NvrUrl/simulationLogin?username=admin&password=admin&menuType="+vm.menuType+"&getToken="+vm.reqAuthtoken+"&role="+vm.role;
    $scope.k2dataUrl={"src":reqUrl}



  }



})();
