/**
 * Created by zhenyu on 17-6-20.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('addDataController', addDataController);

  function addDataController($rootScope,$scope,$uibModalInstance,jsonData) {
    var vm = this;

    if(jsonData==undefined){
      vm.templateInfo = {
        name: "",
        type: [{name : "int", value : 4},{name : "short" , value : 2},{name : "char" , value : null}],
        register: null,
        converter: ""
      }
    }else{
      showData()
    }


    function showData(){
      vm.templateInfo = {
        name: jsonData.name,
        type: [{name : "int", value : 4},{name : "short" , value : 2},{name : "char" , value : null}],
        register: jsonData.register,
        converter: jsonData.converter
      };
      if(jsonData.type.name == "int"){
        $scope.selectedType = vm.templateInfo.type[0];
      }else if(jsonData.type.name == "short"){
        $scope.selectedType = vm.templateInfo.type[1];
      }else{
        $scope.selectedType = vm.templateInfo.type[2];
      }

    }

    // vm.editable = function(){
    //   var ngInput = document.getElementsByTagName("input");
    //   if($scope.selectedType == "char"){
    //     ngInput[1].removeAttribute("readonly");
    //   }else{
    //     ngInput[1].setAttribute("readonly","readonly");
    //   }
    // };

    vm.ok = function () {
      vm.templateInfo.type = $scope.selectedType;
      $uibModalInstance.close(vm.templateInfo);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
