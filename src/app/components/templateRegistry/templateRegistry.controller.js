/**
 * Created by mengwei on 17-3-31.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('templateRegistryMngController', templateRegistryMngController);

  /** @ngInject */
  function templateRegistryMngController($rootScope,$scope,$uibModal,$window) {
    var vm = this;
    vm.jsonData = [];
    vm.versionNumber= $window.sessionStorage["versionNumber"]

    vm.register = function (size) {

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/templateRegistry/newTemplate.html',
          controller: 'newTemplateController as newTemplateController',
          size: size,
          backdrop: false,
          resolve: {
            jsonData: function () {
              return vm.jsonData;
            }
          }
        });

        modalInstance.result.then(function (result) {
          console.log(result);
          vm.jsonData.push(result[0])
          //console.log(vm.jsonData)
        }, function () {
          //取消
        })

    }

    vm.confirm = function (jsonData) {
     console.log(jsonData);

    }





  }
})();
