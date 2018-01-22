/**
 *
 * @author syLong
 * @create 2017-12-28 16:31
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('newTotalDispatchController', newTotalDispatchController);
    function newTotalDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, operatorInfo,minemngResource, MINEMNG_TOTAL_DISPATCH) {
      var vm = this;
      vm.operatorInfo = operatorInfo;

      // 默认时间为第二天
      var effectiveDate = new Date();
      effectiveDate.setDate(effectiveDate.getDate() + 1);
      vm.effectiveDate = effectiveDate;

      vm.entryTimeSetting = {
        //dt: "请选择开始日期",
        open: function ($event) {
          vm.entryTimeSetting.status.opened = true;
        },
        dateOptions: {
          formatYear: 'yy',
          startingDay: 1
        },
        status: {
          opened: false
        }
      };

      // 日期控件相关
      vm.dateOptions = {
        dateDisabled: function(data) {  // 只能选择设定的日期（默认的日期：当前日期的第二天）
          var date = data.date;
          var mode = data.mode;
          if(vm.effectiveDate.getDate() !== date.getDate() || vm.effectiveDate.getMonth() !== date.getMonth()
            || vm.effectiveDate.getFullYear() !== date.getFullYear()) {
            return mode === 'day' && (date.getDate() || date.getMonth() || date.getFullYear());
          }
        },
        formatYear: 'yyyy',
        startingDay: 1
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
        vm.newTotalDispatch.teamList = [];
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


      vm.ok = function () {
        vm.newTotalDispatch.effectiveDate = vm.effectiveDate;
        var rspData = serviceResource.restCallService(MINEMNG_TOTAL_DISPATCH, "ADD", vm.newTotalDispatch);  //post请求
        rspData.then(function (data) {
          if(data.code === 0){
            Notification.success("增加成功！");
            $uibModalInstance.close();
          } else {
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data);
        })
      };

      /**
       * 取消
       */
      vm.cancel = function(){
        $uibModalInstance.dismiss('cancel');
      };

    }
})();
