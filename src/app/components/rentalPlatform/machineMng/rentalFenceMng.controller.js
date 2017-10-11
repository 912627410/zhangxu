/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalFenceMngController', rentalFenceMngController);

  /** @ngInject */
  function rentalFenceMngController($scope, $window, $state, $confirm, languages,$location, $filter, $anchorScroll, serviceResource, NgTableParams, ngTableDefaults, treeFactory, Notification, permissions, rentalService,
                                    RENTAL_ORG_FENCE_PAGE_URL, RENTAL_ORG_FENCE_DELETE_STATUS, RENTAL_ORG_FENCE_COUNT) {
    var vm = this;
    vm.pageSize = 12;
    vm.fenceStatus = {
      fenceCount: 0,
      normalCount: 0,
      lapseCount: 0
    }
    vm.searchCondition = {}
    ngTableDefaults.params.count = vm.pageSize;
    ngTableDefaults.settings.counts = [];


    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 35;//50 topBar的高,15间距,90msgBox高,15间距,35 预留
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    vm.adjustWindow($window.innerHeight);

    /**
     * 查询
     * @param page
     * @param size
     * @param sort
     * @param rentalOrgFence
     */
    vm.query = function (page, size, sort, rentalOrgFence) {
      var restCallURL = RENTAL_ORG_FENCE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || vm.pageSize;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (rentalOrgFence != null) {
        if (rentalOrgFence.fenceName != null && rentalOrgFence.fenceName != undefined) {
          restCallURL += "&search_LIKES_fenceName=" + rentalOrgFence.fenceName;
        }

        if (rentalOrgFence.fenceAddress != null && rentalOrgFence.fenceAddress != undefined) {
          restCallURL += "&search_LIKES_fenceAddress=" + rentalOrgFence.fenceAddress;
        }
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({}, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取围栏数据失败");
      });
    };
    vm.query(null, null, null, null);


    /**
     * 分状态统计
     */
    vm.fenceStatusCount = function () {
      var fenceCountPromis = serviceResource.restCallService(RENTAL_ORG_FENCE_COUNT, "GET");
      fenceCountPromis.then(function (data) {
        var fenceCount = data.content;
        angular.forEach(fenceCount, function (data, index, array) {
          vm.fenceStatus.fenceCount += data.fenceStatusCount;
          if (data.status == 1) {
            vm.fenceStatus.normalCount = data.fenceStatusCount;
          }
          if (data.status == 2) {
            vm.fenceStatus.lapseCount = data.fenceStatusCount;
          }
        })
      }, function (reson) {
        Notification.error("获取围栏数据失败");
      })
    }

    vm.fenceStatusCount()
    /**
     * 新建围栏
     */
    vm.new = function () {
      $state.go('rental.newOrgFence');
    }

    /**
     * 管理操作
     * @param id
     */
    vm.view = function (id) {
      $state.go('rental.updateOrgFence', {id: id})
    }

    /**
     * 删除操作
     * @param id
     */
    vm.delete = function (id) {
      $confirm({text: languages.findKey('areYouWanttoDeleteIt'), title: languages.findKey('deleteConfirmation'), ok: languages.findKey('confirm'), cancel:languages.findKey('cancel')})
        .then(function () {
          var restCall = RENTAL_ORG_FENCE_DELETE_STATUS + "?id=" + id;
          var restPromise = serviceResource.restCallService(restCall, "UPDATE");
          restPromise.then(function (data) {
            Notification.error(languages.findKey('delSuccess'));
            vm.query(null, null, null, null);
          }, function (reason) {
            Notification.error(languages.findKey('delFail'));
          });
        });
    };

  }
})();
