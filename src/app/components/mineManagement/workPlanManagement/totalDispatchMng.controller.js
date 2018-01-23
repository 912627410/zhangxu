/**
 *
 * @author syLong
 * @create 2018-01-19 18:43
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('totalDispatchMngController', totalDispatchMngController);

    function totalDispatchMngController($rootScope, $uibModal, $scope, serviceResource, languages, Notification,minemngResource, NgTableParams, ngTableDefaults,DEFAULT_MINSIZE_PER_PAGE, MINEMNG_TOTAL_DISPATCH) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.selected = []; //选中的总调度

      ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
      ngTableDefaults.settings.counts = [];

      vm.dateOpenStatus = false;
      vm.updateDispatchBtn = true; // 总调度修改按钮
      vm.batchUpdateDispatchBtn = true; // 批量修改总调度按钮

      vm.updateDispatchBtnIsShow = function() {
        if(vm.effectiveDate > getZeroDate()) {
          vm.updateDispatchBtn = true;
          vm.batchUpdateDispatchBtn = true;
          return;
        }
        vm.updateDispatchBtn = false;
        vm.batchUpdateDispatchBtn = false;
      };


      vm.effectiveDate = new Date(); // 默认日期为当天
      vm.page = {
        totalElements: 0
      };

      // 日期控件相关
      vm.dateOpen = function ($event) {
        vm.dateOpenStatus = true;
      };
      vm.dateOptions = {
        dateDisabled: function(data) {  //设置可以选择的日期(2018-01-01 到当前日期的第二天)
          var nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 1);
          var longTimeAgo = new Date('2018-01-01');
          var date = data.date;
          var mode = data.mode;
          if(nextDate.getTime() < date.getTime() || longTimeAgo.getTime() > date.getTime()) {
            return mode === 'day' && (date.getTime());
          }
        },
        formatYear: 'yyyy',
        startingDay: 1
      };

      // 选中与全选
      var dispatchSelected = function (action, totalDispatch) {
        if (action === 'add' && vm.selected.indexOf(totalDispatch) === -1) {
          vm.selected.push(totalDispatch);
        }
        if (action === 'remove' && vm.selected.indexOf(totalDispatch) !== -1) {
          var idx = vm.selected.indexOf(totalDispatch);
          vm.selected.splice(idx, 1);
        }
      };

      vm.totalDispatchSelection = function ($event, totalDispatch) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        dispatchSelected(action, totalDispatch);
      };

      vm.totalDispatchAllSelection = function ($event) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        vm.totalDispatchList.forEach(function (totalDispatch) {
          dispatchSelected(action, totalDispatch);
        })
      };
      vm.isSelected = function (totalDispatch) {
        return vm.selected.indexOf(totalDispatch) >= 0;
      };

      /**
       * 加载作业面列表
       */
      var workFaceListPromise = minemngResource.getWorkFaceList();
      workFaceListPromise.then(function (data) {
        vm.workFaceList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 加载排土场列表
       */
      var dumpFieldListPromise = minemngResource.getDumpFieldList();
      dumpFieldListPromise.then(function (data) {
        vm.dumpFieldList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 加载车队列表
       */
      var fleetListPromise = minemngResource.getFleetList();
      fleetListPromise.then(function (data) {
        vm.fleetList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 加载小组列表
       * @param fleetId
       */
      vm.getTeamList = function (fleetId) {
        vm.teamList = null;
        vm.totalDispatch.team = null;
        var teamListPromise = minemngResource.getTeamList(fleetId);
        if(teamListPromise != null) {
          teamListPromise.then(function (data) {
            vm.teamList = data;
          }, function (reason) {
            Notification.error(reason.data);
          });
        }
      };

      /**
       * 加载班次列表
       */
      var workShiftListPromise = minemngResource.getWorkShiftAllList();
      workShiftListPromise.then(function (data) {
        vm.workShiftList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });


      /**
       * 分页查询总调度
       * @param page
       * @param size
       * @param sort
       */
      vm.query = function (page, size, sort) {
        vm.checked = false;
        var restCallURL = MINEMNG_TOTAL_DISPATCH;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
        var sortUrl = sort || "record_time";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if(vm.effectiveDate == null || vm.effectiveDate === "") {
          Notification.warning("请选择日期");
          return;
        }
        var month = vm.effectiveDate.getMonth() + 1;
        var effectiveDate = vm.effectiveDate.getFullYear() + '-' + month + '-' + vm.effectiveDate.getDate();
        restCallURL += "&effectiveDate=" + effectiveDate;

        if (vm.totalDispatch != null && vm.totalDispatch !== '' && vm.totalDispatch !== 'undefined') {
          if (vm.totalDispatch.fleet != null && vm.totalDispatch.fleet !== '') {
            restCallURL += "&fleet=" + vm.totalDispatch.fleet;
          }
          if (vm.totalDispatch.team != null && vm.totalDispatch.team !== '') {
            restCallURL += "&team=" + vm.totalDispatch.team;
          }
          if (vm.totalDispatch.workFace != null && vm.totalDispatch.workFace !== '') {
            restCallURL += "&workFace=" + vm.totalDispatch.workFace;
          }
          if (vm.totalDispatch.dumpField != null && vm.totalDispatch.dumpField !== '') {
            restCallURL += "&dumpField=" + vm.totalDispatch.dumpField;
          }
          if (vm.totalDispatch.workShift != null && vm.totalDispatch.workShift !== '') {
            restCallURL += "&workShift=" + vm.totalDispatch.workShift;
          }
        }

        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.content.length > 0) {
            vm.totalDispatchList = data.content;
            vm.tableParams = new NgTableParams({},
              {
                dataset: data.content
              });
            vm.page = data.page;
            vm.pageNumber = data.page.number + 1;
            vm.selected = [];
          } else {
            Notification.warning(languages.findKey('noDataYet'));
            vm.totalDispatchList = null;
            vm.tableParams = new NgTableParams({}, {
              dataset: null
            });
            vm.page.totalElements = 0;
          }
          vm.updateDispatchBtnIsShow();
        }, function (reason) {
          Notification.error(reason);
          vm.totalDispatchList = null;
        });
      };
      vm.query(null, null, null);



      /**
       * 增加总调度
       */
      vm.add = function (size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/workPlanManagement/newTotalDispatch.html',
          controller: 'newTotalDispatchController as newTotalDispatchCtrl',
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
       * 修改总调度
       * @param totalDispatch
       * @param size
       */
      vm.update = function (totalDispatch, size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/workPlanManagement/updateTotalDispatch.html',
          controller: 'updateTotalDispatchController as updateTotalDispatchCtrl',
          size: size,
          backdrop: false,
          scope: $scope,
          resolve: {
            totalDispatch: function () {
              return totalDispatch;
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
       * 批量修改总调度
       * @param size
       */
      vm.batchUpdate = function (size) {
        if(vm.selected.length <= 0) {
          Notification.warning("请选择需要修改的记录");
          return;
        }
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/workPlanManagement/batchUpdateTotalDispatch.html',
          controller: 'batchUpdateTotalDispatchController as batchUpdateTotalDispatchCtrl',
          size: size,
          backdrop: false,
          scope: $scope,
          resolve: {
            totalDispatchList: function () {
              return vm.selected;
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
       * 重置总调度搜索框
       */
      vm.reset = function () {
        vm.totalDispatch = null;
        vm.effectiveDate = new Date();
      };
    }
})();
