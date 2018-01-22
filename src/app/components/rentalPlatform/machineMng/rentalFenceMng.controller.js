/**
 * @author riqian.ma
 * @date 2017/7/29.
 * @description 围栏修改controller
 * @updated1 xielong.wang
 * @update_date 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalFenceMngController', rentalFenceMngController);

  /** @ngInject */
  function rentalFenceMngController($uibModal, $window, $confirm, $rootScope, uiGmapGoogleMapApi, languages, serviceResource, NgTableParams, ngTableDefaults, Notification,
                                    RENTAL_ORG_FENCE_PAGE_URL, RENTAL_ORG_FENCE_DELETE_STATUS, RENTAL_ORG_FENCE_COUNT, RENTAL_ORG_FENCE_URL) {
    var vm = this;
    vm.pageSize = 12;
    vm.searchCondition = {}
    ngTableDefaults.params.count = vm.pageSize;
    ngTableDefaults.settings.counts = [];


    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 35;//50 topBar的高,15间距,90msgBox高,15间距,35 预留
      vm.baseBoxMapContainer = {
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
      restCallURL +="?page=" + pageUrl + '&sort=' + sortUrl;
      if (rentalOrgFence != null) {
        if (rentalOrgFence.fenceName != null && rentalOrgFence.fenceName != undefined) {
          restCallURL += "&search_LIKES_fenceName=" + rentalOrgFence.fenceName;
        }
        if (rentalOrgFence.fenceAddress != null && rentalOrgFence.fenceAddress != undefined) {
          restCallURL += "&search_LIKES_fenceAddress=" + rentalOrgFence.fenceAddress;
        }
      }
      var listrestCallURL =restCallURL + '&size=' + sizeUrl;
      //列表数据
      var listrspData = serviceResource.restCallService(listrestCallURL, "GET");
      listrspData.then(function (data) {
        vm.tableParams = new NgTableParams({}, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取围栏数据失败");
      });
      //地图数据
      var maprspData = serviceResource.restCallService(restCallURL, "GET");
      maprspData.then(function (data) {
        vm.dataWithoutPage = data.content;
        serviceResource.refreshMapWithFenceInfo("fenceMap", vm.dataWithoutPage, 4, null, null, true,function () {},true);
      }, function (reason) {
        Notification.error("获取围栏数据失败");
      });
    };

    /*默认展示列表*/
    vm.radioListType = "list";

    vm.query(null, null, null, null);

    /*初始化地图*/
    vm.initFenceMap = function () {
      serviceResource.refreshMapWithFenceInfo("fenceMap", vm.dataWithoutPage, 4, null, null, true,function () {},true);
    };

    /**
     * 分状态统计
     */
    vm.fenceStatusCount = function () {
      vm.normalFenceCount=0
      // vm.fenceStatus = {
      //   fenceCount: 0,
      //   normalCount: 0,
      //   lapseCount: 0
      // }
      var fenceCountPromis = serviceResource.restCallService(RENTAL_ORG_FENCE_COUNT, "GET");
      fenceCountPromis.then(function (data) {
        var fenceCount = data.content;
        angular.forEach(fenceCount, function (data) {
          if (data.status == 1) {
            vm.normalFenceCount = data.fenceStatusCount;
          }
          // if (data.status == 1) {
          //   vm.fenceStatus.normalCount = data.fenceStatusCount;
          // }
          // if (data.status == 2) {
          //   vm.fenceStatus.lapseCount = data.fenceStatusCount;
          // }
        })
        // vm.fenceStatus.fenceCount=vm.fenceStatus.normalCount+vm.fenceStatus.lapseCount;
      }, function (reson) {
        Notification.error("获取围栏数据失败");
      })
    }
    vm.fenceStatusCount()

    /**
     * 新建围栏
     */
    vm.new = function () {
      //$state.go('rental.newOrgFence');
      var modalInstance = $uibModal.open({
        animation: true,
        backdrop: false,
        templateUrl: 'app/components/rentalPlatform/machineMng/newRentalFenceMng.html',
        controller: 'newRentalFenceController',
        controllerAs: 'newRentalFenceCtrl',
        size: 'lg'
      });
      modalInstance.result.then(function (result) {
        if(result!=null){
          vm.tableParams.data.splice(0, 0, result);
          vm.query(null, null, null, vm.searchCondition);
          vm.fenceStatusCount()
        }
      }, function () {
        //取消
      });

    }

    /**
     * 管理操作
     * @param id
     */
    vm.view = function (rentalOrgFence) {
      if($rootScope.userInfo.userdto.ssn==rentalOrgFence.createUser){
        var fenceUrl = RENTAL_ORG_FENCE_URL + "?id=" + rentalOrgFence.id;
        var rspdata = serviceResource.restCallService(fenceUrl, "GET");
        rspdata.then(function (data) {
          var rentalFence = data.content;
          var modalInstance = $uibModal.open({
            animation: true,
            backdrop: false,
            templateUrl: 'app/components/rentalPlatform/machineMng/updateRentalFenceMng.html',
            controller: 'updateRentalFenceController',
            controllerAs: 'updateRentalFenceCtrl',
            size: 'lg',
            resolve: {
              rentalFence: function () {
                return rentalFence;
              }
            }
          });
          modalInstance.result.then(function (result) {
            var tabList = vm.tableParams.data;
            //更新内容
            for (var i = 0; i < tabList.length; i++) {
              if (tabList[i].id == result.id) {
                tabList[i] = result;
              }
            }
            vm.query(null, null, null, vm.searchCondition);
          }, function () {
            //取消
          });
        })
      }
      else{
        Notification.warning("只能操作本人创建的数据");
      }
    }

    /**
     * 删除操作
     * @param id
     */
    vm.delete = function (id) {
      $confirm({
        text: languages.findKey('areYouWanttoDeleteIt'),
        title: languages.findKey('deleteConfirmation'),
        ok: languages.findKey('confirm'),
        cancel: languages.findKey('cancel')
      })
        .then(function () {
          var restCall = RENTAL_ORG_FENCE_DELETE_STATUS + "?id=" + id;
          var restPromise = serviceResource.restCallService(restCall, "UPDATE");
          restPromise.then(function (data) {
            Notification.error(languages.findKey('delSuccess'));
            vm.query(null, vm.pageSize, null, vm.searchCondition);
            vm.fenceStatusCount()
          }, function (reason) {
            Notification.error(languages.findKey('delFail'));
          });
        });
    };

  }
})();
