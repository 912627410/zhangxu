/**
 * Created by yalong on 17-11-30.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newUpdateObjectController', newUpdateObjectController);

  /** @ngInject */
  function newUpdateObjectController($rootScope, $scope, $uibModalInstance,serviceResource, Notification, UPDATE_OBJECT_BROTHERS, selectedObject) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectedObject = selectedObject;
    vm.parentShow = true;

    if(vm.selectedObject == null || vm.selectedObject == "" || vm.selectedObject.level == 1) {
      vm.parentShow = false;
    } else {
      vm.parentShow = true;
      vm.queryObject(vm.selectedObject.parentId);

    }


    vm.queryObject = function (id) {
      var restCallURL = UPDATE_OBJECT_BROTHERS;
      restCallURL += "?id=" + id;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.parentObject = data;
      });
    };



    // vm.ok = function (orgLabel,orgName,orgSimpleName) {
    //   var newOrg = {
    //     parentId: vm.selectedOrg.id,
    //     label: orgLabel,
    //     name: orgName,
    //     orgSimpleName:orgSimpleName
    //   };
    //
    //   var restPromise = serviceResource.restUpdateRequest(ORG_ADD_URL,newOrg);
    //   restPromise.then(function (data){
    //     Notification.success("新增组织成功!");
    //     //新增组织更新到原组织树
    //     $uibModalInstance.close(data.content);
    //   },function(reason){
    //     Notification.error(reason.data.message);
    //   });
    // };


    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
