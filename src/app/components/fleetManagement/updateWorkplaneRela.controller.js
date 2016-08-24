/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateWorkplaneRelaController', updateWorkplaneRelaController);

  /** @ngInject */
  function updateWorkplaneRelaController($rootScope,$scope,$http,$confirm,$filter,NgTableParams,$uibModalInstance,WORKPLANE_PAGE,FLEET_WORKPLANE_RELA,serviceResource, Notification,fleet) {
    var vm = this;
    vm.fleet = fleet;
    vm.operatorInfo =$rootScope.userInfo;

    vm.query = function (page, size, sort, workplane) {
      var restCallURL = WORKPLANE_PAGE;
      var pageUrl = page || 0;
      var sizeUrl = size || 5;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != workplane) {

        if (null != workplane.id&&workplane.id!="") {
          restCallURL += "&search_LIKE_id=" + $filter('uppercase')(workplane.id);
        }
        if (null != workplane.name&&workplane.name!="") {
          restCallURL += "&search_LIKE_name=" + $filter('uppercase')(workplane.name);
        }

      }

      if(null != vm.fleet.workplaneVo && vm.fleet.workplaneVo.id!=null){
        restCallURL += "&search_NEQ_id=" + $filter('uppercase')(vm.fleet.workplaneVo.id);
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取作业面数据失败");
      });
    };

    vm.relaToFleet = function (workplane) {
      if(workplane!=null && vm.fleet!=null){
        vm.fleet.workplaneDto=workplane;
        var rspdata = serviceResource.restUpdateRequest(FLEET_WORKPLANE_RELA,vm.fleet);
        rspdata.then(function (data) {
          if(data.code===0){
            vm.fleet = data.content;
            vm.query();
            Notification.success("更新作业面成功!");
            //$uibModalInstance.close(data.content);
          }else{
            Notification.error(data.message);
          }
        },function (reason) {
          Notification.error(reason.data.message);
        })
      }

    }
    vm.query();

    vm.cancel = function () {
      $uibModalInstance.close(vm.fleet);
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
