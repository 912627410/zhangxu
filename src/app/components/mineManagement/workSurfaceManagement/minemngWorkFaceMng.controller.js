/**
 *
 * @author weihua
 * @create 2018-01-19 20:02
 * @email  hua.wei@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('minemngWorkFaceMngController', minemngWorkFaceMngController);

    function minemngWorkFaceMngController($scope, $uibModal,$confirm, ngTableDefaults, languages, serviceResource,NgTableParams,Notification,
                                          MINEMNG_DELETE_WORKFACE, DEFAULT_MINSIZE_PER_PAGE, MINEMNG_WORKFACE) {
      var vm = this;
      vm.operatorInfo = $scope.userInfo;

      vm.page = {
        totalElements: 0
      };
      ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
      ngTableDefaults.settings.counts = [];

      /**
       * 分页查询
       */
      vm.query=function (page, size, sort) {
        var restCallURL=MINEMNG_WORKFACE;
        var pageUrl = page||0;
        var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
        var sortUrl = sort || "id,desc";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.content.length > 0) {
            vm.tableParams = new NgTableParams({}, {
              dataset: data.content
            });
            vm.page = data.page;
            vm.pageNumber = data.page.number + 1;
            vm.page.totalElements=data.page.totalElements;
          } else {
            Notification.warning(languages.findKey('暂无数据'));
            vm.tableParams = new NgTableParams({},{
              dataset: null
            });
            vm.page.totalElements = 0;
          }
        }, function (reason) {
          Notification.error(reason);
        });
      };
      vm.query(null, null, null);

      /**
       * 新增
       */
      vm.new = function () {
        var modalInstance = $uibModal.open({
          animation:true,
          templateUrl:'app/components/mineManagement/workSurfaceManagement/minemngNewWorkFace.html',
          controller:'minemngNewWorkFaceController',
          controllerAs:'minemngNewWorkFaceCtrl',
          size:'md'
        });
        modalInstance.result.then(function (result) {
          vm.query(null, null, null);
        }, function () {
          //取消
        });

      }

      /**
       * 修改
       */
      vm.update = function (workFace) {
        var modalInstance=$uibModal.open({
          animation : true,
          templateUrl:'app/components/mineManagement/workSurfaceManagement/minemngUpdateWorkFace.html',
          controller:'minemngUpdateWorkFaceController',
          controllerAs:'minemngUpdateWorkFaceCtrl',
          size:'md',
          resolve:{
            workFace:function () {
              return workFace;
            }
          }
        });
        modalInstance.result.then(function (result) {
          vm.query(null,null,null);
        },function () {

        });
      };


      /**
       * 删除
       */
      vm.delete=function (id) {
        $confirm({
          text: languages.findKey('areYouWanttoDeleteIt'),
          title: languages.findKey('deleteConfirmation'),
          ok: languages.findKey('confirm'),
          cancel:languages.findKey('cancel')
        }).then(function () {
            var restCall = MINEMNG_DELETE_WORKFACE + "?id=" + id;
            var restPromise = serviceResource.restCallService(restCall, "UPDATE");
            restPromise.then(function (data) {
              Notification.success(languages.findKey('delSuccess'));
              vm.query(null, null, null);
            }, function (reason) {
              Notification.error(languages.findKey('delFail'));
            });
          });
      };

    }
})();
