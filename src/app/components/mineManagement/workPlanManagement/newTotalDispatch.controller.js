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
    function newTotalDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, operatorInfo,
                                        MINEMNG_WORKFACE_LIST, MINEMNG_DUMP_FIELD_LIST, MINEMNG_FLEET_LIST, MINEMNG_WORK_SHIFT_LIST, MINEMNG_TOTAL_DISPATCH) {
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
          if(vm.effectiveDate.getDate() !== date.getDate() || vm.effectiveDate.getMonth() !== date.getMonth()) {
            return mode === 'day' && (date.getDate() || date.getModel());
          }
        },
        formatYear: 'yyyy',
        startingDay: 1
      };

      /**
       * 加载作业面列表
       */
      vm.getWorkFaceList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_WORKFACE_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.workFaceList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getWorkFaceList();

      /**
       * 加载排土场列表
       */
      vm.getDumpFieldList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_DUMP_FIELD_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.dumpFieldList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getDumpFieldList();

      /**
       * 加载车队列表
       */
      vm.getFleetList = function () {
        var url = MINEMNG_FLEET_LIST + "?parentId=0";
        var rspDate = serviceResource.restCallService(url, "QUERY");
        rspDate.then(function (data) {
          vm.fleetList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getFleetList();

      /**
       * 加载小组列表
       * @param fleetId
       */
      vm.getTeamList = function (fleetId) {
        vm.newTotalDispatch.teamList = [];
        if(fleetId != null && fleetId !== "" && fleetId !== "undefined") {
          var url = MINEMNG_FLEET_LIST + "?parentId=" + fleetId;
          var rspDate = serviceResource.restCallService(url, "QUERY");
          rspDate.then(function (data) {
            vm.teamList = data;
          },function (reason) {
            Notification.error(reason.data);
          })
        }
      };

      /**
       * 加载班次列表
       */
      vm.getWorkShiftList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_WORK_SHIFT_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.workShiftList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getWorkShiftList();


      vm.ok = function () {
        if(vm.newTotalDispatch == null || vm.newTotalDispatch === "" || vm.newTotalDispatch === "undefined") {
          Notification.warning("请选择相关信息");
          return;
        }
        if(vm.newTotalDispatch.fleet == null || vm.newTotalDispatch.fleet === "") {
          Notification.warning("请选择车队");
          return;
        }
        if(vm.newTotalDispatch.workFace == null || vm.newTotalDispatch.workFace === "") {
          Notification.warning("请选择工作面");
          return;
        }
        if(vm.newTotalDispatch.dumpField == null || vm.newTotalDispatch.dumpField === "") {
          Notification.warning("请选择排土场");
          return;
        }
        if(vm.newTotalDispatch.workShift == null || vm.newTotalDispatch.workShift === "") {
          Notification.warning("请选择班次");
          return;
        }
        if(vm.effectiveDate == null || vm.effectiveDate === "") {
          Notification.warning("请选择日期");
          return;
        }
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
