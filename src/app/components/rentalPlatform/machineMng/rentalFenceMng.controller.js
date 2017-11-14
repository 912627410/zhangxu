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
  function rentalFenceMngController($uibModal, $window, $confirm, $rootScope,uiGmapGoogleMapApi,languages, serviceResource, NgTableParams, ngTableDefaults, Notification,
                                    RENTAL_ORG_FENCE_PAGE_URL, RENTAL_ORG_FENCE_DELETE_STATUS, RENTAL_ORG_FENCE_COUNT,RENTAL_ORG_FENCE_URL) {
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

    /*默认展示列表*/
    vm.radioListType = "list";

    /*初始化地图*/
    vm.initFenceMap=function(){
      vm.fenceMap = {
        center:  {latitude: 32.115170, longitude:102.355140},
        zoom: 8,
        options: {scrollwheel: false, scaleControl: true},
        markers:[]
      };
      uiGmapGoogleMapApi.then(function(maps) {
        console.log("init google map success");
      });
      if ($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH") {
        vm.fenceMap = serviceResource.refreshGoogleMapWithDeviceInfo();
      } else {
        serviceResource.refreshMapWithDeviceInfo("fenceMap", null, 4);
      }
      //console.log(vm.map)
      /*vm.refreshMap = function () {
        if($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH"){
          vm.fenceMap = serviceResource.refreshGoogleMapWithDeviceInfo();
        }else{
          serviceResource.refreshMapWithDeviceInfo("fenceMap", null,4);
        }
      }*/
    };

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
      //$state.go('rental.newOrgFence');
      var modalInstance = $uibModal.open({
        animation: true,
        backdrop: false,
        templateUrl: 'app/components/rentalPlatform/machineMng/newRentalFenceMng.html',
        controller: 'newRentalFenceController',
        controllerAs:'newRentalFenceCtrl',
        size: 'lg'
      });
      modalInstance.result.then(function (result) {
        vm.fenceStatus.fenceCount += 1;
        vm.fenceStatus.normalCount += 1;
        vm.tableParams.data.splice(0, 0, result);
      }, function () {
        //取消
      });

    }

    /**
     * 管理操作
     * @param id
     */
    vm.view = function (id) {
      var fenceUrl = RENTAL_ORG_FENCE_URL+"?id=" + id;
      var rspdata = serviceResource.restCallService(fenceUrl,"GET");
      rspdata.then(function (data) {
        var rentalFence = data.content;
        var modalInstance = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/machineMng/updateRentalFenceMng.html',
          controller: 'updateRentalFenceController',
          controllerAs:'updateRentalFenceCtrl',
          size: 'lg',
          resolve: {
            rentalFence: function () {
              return rentalFence;
            }
          }
        });
        modalInstance.result.then(function (result) {
          var tabList=vm.tableParams.data;
          //更新内容
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.id){
              tabList[i]=result;
            }
          }
        }, function () {
          //取消
        });
      })

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
