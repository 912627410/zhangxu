/**
 * Created by develop on 5/13/16.
 */

(function(){
    'use strict'
    angular.module('GPSCloud').controller('updateOrgController',updateOrgCtrl);

    function updateOrgCtrl($uibModalInstance,ORG_URL,serviceResource,Notification,selectedOrg,parentOrg) {
        var vm =this;
        vm.selectedOrg=selectedOrg;
        vm.parentOrg=parentOrg;
        vm.ok= function(newOrg){
            var restPromise =serviceResource.restUpdateRequest(ORG_URL,newOrg);
            restPromise.then(function (data) {
                Notification.success("更新组织成功");
                $uibModalInstance.close();
            },function(reason){
                Notification.error("更新组织失败: "+reason.data.message);
            });
        };

        vm.cancel=function(){
            $uibModalInstance.dismiss('cancel');
        }
    }

})();
