/**
 *
 * @author syLong
 * @create 2017-12-27 22:08
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('checkPointMngController', checkPointMngController);
    function checkPointMngController($rootScope, $scope, Notification, $uibModal, serviceResource, $confirm, languages, NgTableParams,
                                     ngTableDefaults, MINEMNG_CHECK_POINT, MINEMNG_DELETE_CHECK_POINT) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      ngTableDefaults.params.count = 20;
      ngTableDefaults.settings.counts = [];

      vm.checkPointPage = {
        totalElements: 0
      };

      /**
       * 分页查询
       * @param page
       * @param size
       * @param sort
       */
      vm.query = function (page, size, sort) {
        var restCallURL = MINEMNG_CHECK_POINT;
        var pageUrl = page || 0;
        var sizeUrl = size || 20;
        var sortUrl = sort || "update_time";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if(vm.queryName != null && vm.queryName !== "" && vm.queryName !== "undefined") {
          restCallURL += "&name=" + vm.queryName;
        }
        if(vm.queryRadius != null && vm.queryRadius !== "" && vm.queryRadius !== "undefined") {
          restCallURL += "&radius=" + vm.queryRadius;
        }

        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.content.length > 0) {
            vm.checkPointTableParams = new NgTableParams({}, {
              dataset: data.content
            });
            vm.checkPointPage = data.page;
            vm.checkPoint_pagenumber = data.page.number + 1;
          } else {
            Notification.warning(languages.findKey('noDataYet'));
            vm.checkPointTableParams = new NgTableParams({},{
              dataset: null
            });
            vm.checkPointPage.totalElements = 0;
          }
        }, function (reason) {
          Notification.error(reason);
        });
      };
      vm.query(null, null, null);

      /**
       * 新增
       * TODO 平台暂时不能增加
       */
      vm.addCheckPoint = function(size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/checkPointManagement/newCheckPoint.html',
          controller: 'newCheckPointController as newCheckPointCtrl',
          size: size,
          backdrop:false,
          scope:$scope,
          resolve: {
            operatorInfo: function () {
              return vm.userInfo;
            }
          }
        });
        modalInstance.result.then(function (result) {
          vm.query(null, null, null);
        }, function () {
          //取消
        });
      };

      /**
       * 修改
       * @param checkPoint
       * @param size
       */
      vm.update = function (checkPoint, size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/checkPointManagement/updateCheckPoint.html',
          controller: 'updateCheckPointController as updateCheckPointCtrl',
          size: size,
          backdrop: false,
          scope: $scope,
          resolve: {
            checkPoint: function () {
              return checkPoint;
            }
          }
        });
        modalInstance.result.then(function () {
          vm.query(null, null, null);
        }, function () {
          //取消
        });
      };

      /**
       * 删除
       * @param id
       */
      vm.delete = function (id) {
        if(id == null || id === "" || id === "undefined") {
          Notification.warning("请选择删除的信息");
          return;
        }
        $confirm({
          text: languages.findKey('areYouWanttoDeleteIt'),
          title: languages.findKey('deleteConfirmation'),
          ok: languages.findKey('confirm'),
          cancel:languages.findKey('cancel')
        }).then(function () {
          var restCall = MINEMNG_DELETE_CHECK_POINT + "?id=" + id;
          var restPromise = serviceResource.restCallService(restCall, "UPDATE");
          restPromise.then(function (data) {
            Notification.success(data.content);
            vm.query(null, null, null);
          }, function (reason) {
            Notification.error(languages.findKey('delFail'));
          });
        });
      };

      /**
       * 重置查询框
       */
      vm.reset = function () {
        vm.queryName = null;
        vm.queryRadius = null;
      };

    }
})();
