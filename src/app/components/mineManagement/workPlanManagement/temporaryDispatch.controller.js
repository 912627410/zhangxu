/**
 *
 * @author syLong
 * @create 2018-01-19 18:58
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('temporaryDispatchController', temporaryDispatchController);

    function temporaryDispatchController($rootScope, $confirm, $uibModal, $scope, serviceResource, languages, Notification, NgTableParams, ngTableDefaults,
                                         DEFAULT_MINSIZE_PER_PAGE, MINEMNG_TEMPORARY_DISPATCH, MINEMNG_CANCEL_TEMPORARY_DISPATCH) {

      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.selected = []; //选中的临时调度的i车辆d

      ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
      ngTableDefaults.settings.counts = [];

      vm.page = {
        totalElements: 0
      };

      // 选中与全选
      var dispatchSelected = function (action, machineId) {
        if (action === 'add' && vm.selected.indexOf(machineId) === -1) {
          vm.selected.push(machineId);
        }
        if (action === 'remove' && vm.selected.indexOf(machineId) !== -1) {
          var idx = vm.selected.indexOf(machineId);
          vm.selected.splice(idx, 1);
        }
      };
      vm.temporaryDispatchSelection = function ($event, temporaryDispatch) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        dispatchSelected(action, temporaryDispatch.minemngMachineId);
      };
      vm.temporaryDispatchAllSelection = function ($event) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        vm.temporaryDispatchList.forEach(function (temporaryDispatch) {
          dispatchSelected(action, temporaryDispatch.minemngMachineId);
        })
      };
      vm.isSelected = function (temporaryDispatch) {
        return vm.selected.indexOf(temporaryDispatch.minemngMachineId) >= 0;
      };

      /**
       * 查询临时调度
       * @param page
       * @param size
       * @param sort
       */
      vm.query = function (page, size, sort) {
        vm.checked = false;
        var restCallURL = MINEMNG_TEMPORARY_DISPATCH;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
        var sortUrl = sort || "record_time";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (vm.carNumber != null && vm.carNumber !== '' && vm.carNumber !== 'undefined') {
          restCallURL += "&carNumber=" + vm.carNumber;
        }
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.content.length > 0) {
            vm.temporaryDispatchList = data.content;
            vm.tableParams = new NgTableParams({},
              {
                dataset: data.content
              });
            vm.page = data.page;
            vm.pageNumber = data.page.number + 1;
            vm.selected = [];
          } else {
            Notification.warning(languages.findKey('noDataYet'));
            vm.temporaryDispatchList = null;
            vm.tableParams = new NgTableParams({}, {
              dataset: null
            });
            vm.page.totalElements = 0;
          }
        }, function (reason) {
          Notification.error(reason);
          vm.temporaryDispatchList = null;
        });
      };
      vm.query(null, null, null);

      /**
       * 新增临时调度
       * @param size
       */
      vm.add = function (size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/workPlanManagement/newTemporaryDispatch.html',
          controller: 'newTemporaryDispatchController as newTemporaryDispatchCtrl',
          size: size,
          backdrop: false,
          scope: $scope,
          resolve: {
            operatorInfo: function () {
              return vm.userInfo;
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
       * 修改临时调度
       * @param temporaryDispatch
       * @param size
       */
      vm.update = function (temporaryDispatch, size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/workPlanManagement/updateTemporaryDispatch.html',
          controller: 'updateTemporaryDispatchController as updateTemporaryDispatchCtrl',
          size: size,
          backdrop: false,
          scope: $scope,
          resolve: {
            temporaryDispatch: function () {
              return temporaryDispatch;
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
       * 取消调度
       * @param machineId
       */
      vm.cancelDispatch = function (machineId) {
        $confirm({
          text: "确定要取消调度吗？",
          title: "取消调度",
          ok: languages.findKey('confirm'),
          cancel:languages.findKey('cancel')
        }).then(function () {
          var restPromise = serviceResource.restUpdateRequest(MINEMNG_CANCEL_TEMPORARY_DISPATCH, [machineId]);
          restPromise.then(function (data) {
            if(data.code === 0) {
              Notification.success(data.content);
              vm.query(null, null, null);
            } else{
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(reason.data);
          });
        });
      };

      /**
       * 批量取消调度
       */
      vm.batchCancel = function () {
        if(vm.selected.length <= 0) {
          Notification.warning("请选择需要取消的记录");
          return;
        }
        $confirm({
          text: "确定要批量取消调度吗？",
          title: "批量取消调度",
          ok: languages.findKey('confirm'),
          cancel:languages.findKey('cancel')
        }).then(function () {
          var restPromise = serviceResource.restUpdateRequest(MINEMNG_CANCEL_TEMPORARY_DISPATCH, vm.selected);
          restPromise.then(function (data) {
            if(data.code === 0) {
              Notification.success(data.content);
              vm.query(null, null, null);
            } else{
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(reason.data);
          });
        });
      };

      /**
       * 重置搜索框
       */
      vm.reset = function () {
        vm.carNumber = null;
      };
    }
})();
