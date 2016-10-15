(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('sensorController', sensorController);

  function sensorController($rootScope,$window, $scope, $timeout, $confirm, $filter, $uibModalInstance,item, serviceResource) {
    var vm = this;
    vm.title="状态量列表";
    vm.records = JSON.parse($window.sessionStorage["sensor"]);
    vm.selected = [];
    vm.selectedTags = [];
    vm.jsons={}
    vm.selectAll = false;//是否全选标志

    var updateSelected = function(action,id,name){
      if(action == 'add' && vm.selected.indexOf(id) == -1){
        vm.jsons[id]=name;
        vm.selected.push(id);
        vm.selectedTags.push(name);
      }
      if(action == 'remove' && vm.selected.indexOf(id)!=-1){
        var idx = vm.selected.indexOf(id);
        delete vm.jsons[id];
        vm.selected.splice(idx,1);
        vm.selectedTags.splice(idx,1);
      }
    }

    vm.updateSelection = function($event, id){
      var checkbox = $event.target;
      var action = (checkbox.checked?'add':'remove');
      updateSelected(action,id,checkbox.name);
    }

    vm.isSelected = function(id){
      return vm.selected.indexOf(id)>=0;
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.confirm = function () {
      $uibModalInstance.close(vm.jsons);
    }

  }

})();
