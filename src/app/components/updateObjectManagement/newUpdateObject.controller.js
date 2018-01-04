/**
 * Created by yalong on 17-11-30.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newUpdateObjectController', newUpdateObjectController);

  /** @ngInject */
  function newUpdateObjectController($rootScope, $uibModalInstance, Notification, serviceResource, selectedObject, UPDATE_OBJECT_LIST, UPDATE_OBJECT_URL) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectedObject = selectedObject;
    vm.selectedId = vm.selectedObject.id;
    vm.selectedLevel = vm.selectedObject.level;
    vm.parentShow = true;
    vm.newLabel = "";
    vm.newCode = "";

    /**
     *
     * @param parentId
       */
    vm.queryObject = function (parentId) {
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=" + parentId;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.parentObject = data;
      });
    };

    if(vm.selectedObject == null || vm.selectedObject == "") {
      vm.parentShow = false;
    } else {
      vm.parentShow = true;
      vm.queryObject(vm.selectedObject.parentId);
    }


    /**
     * 新建升级对象
     */
    vm.ok = function () {
      if(vm.newLabel == null || vm.newLabel == "") {
        Notification.warning("请录入名称");
        return;
      }
      if(vm.newCode == null || vm.newCode == "") {
        Notification.warning("请录入代码");
        return;
      }
      if(vm.selectedId == null || vm.selectedId == "") {
        vm.selectedId = 0;
      }
      if(vm.selectedLevel == null || vm.selectedLevel == "") {
        vm.selectedLevel = 0;
      }

      var newUpdateObject = {
        parentId: vm.selectedId,
        label: vm.newLabel,
        code: vm.newCode,
        level: parseInt(vm.selectedLevel) + 1
      };

      var restPromise = serviceResource.restAddRequest(UPDATE_OBJECT_URL,newUpdateObject);
      restPromise.then(function (data){
        if(data.code===0){
          Notification.success(data.content);
          $uibModalInstance.close();
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        Notification.error(reason.data.message);
      });
    };


    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
