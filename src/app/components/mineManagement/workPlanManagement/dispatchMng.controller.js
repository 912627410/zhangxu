/**
 *
 * @author syLong
 * @create 2017-12-22 13:57
 * @email  yalong.shang@nvr-china.com
 * @description 调度管理
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('dispatchMngController', dispatchMngController);

  function dispatchMngController($rootScope, $filter, $confirm, $uibModal, $scope, serviceResource, permissions, languages, Notification, mqttws,
                                 NgTableParams, ngTableDefaults, MINEMNG_WORKFACE_LIST, MINEMNG_DUMP_FIELD_LIST, MINEMNG_FLEET_LIST, MINEMNG_WORK_SHIFT_ALL_LIST,
                                 MINEMNG_TOTAL_DISPATCH, MINEMNG_MACHINE_TYPE_LIST, MINEMNG_TEMPORARY_DISPATCH) {
    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.sendTopic = "IM.Harvesters.";
    vm.totalDispatchShow = true;
    vm.temporaryDispatchShow = false;
    vm.selectAll = false; //是否全选标志
    vm.totalDispatchSelected = []; //选中的总调度的id

    ngTableDefaults.params.count = 20;
    ngTableDefaults.settings.counts = [];

    vm.totalDispatchPage = {
      totalElements: 0
    };
    vm.temporaryDispatchPage = {
      totalElements: 0
    };

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
    // date picker
    vm.entryTimeOpenStatus = {
      opened: false
    };
    vm.entryTimeOpen = function ($event) {
      vm.entryTimeOpenStatus.opened = true;
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

    vm.effectiveDate = new Date(); // 默认日期为当天
    vm.updateTotalDispatchBtn = true; // 总调度修改按钮

    vm.updateTotalDispatchBtnIsShow = function() {
      var nowDate = new Date(new Date().toLocaleDateString());
      if(vm.effectiveDate > nowDate) {
        vm.updateTotalDispatchBtn = true;
        return;
      }
      vm.updateTotalDispatchBtn = false;
    };


    // var topic = 'IM.Harvesters.'+userInfo.userdto.ssn;
    // var client = mqttws.createClient(userInfo.userdto.ssn, topic);
    // client.onConnectionLost = function (responseObject) {
    //   console.log("onConnectionLost:"+responseObject.errorMessage);
    //   if (responseObject.errorCode !== 0) {
    //     console.log("连接已断开");
    //     client = mqttws.createClient(userInfo.userdto.ssn, topic);
    //   }
    // };
    // client.onMessageArrived = function (message) {
    //   console.log("收到消息:"+message.payloadString);
    //
    //
    //   var WSMessage;
    //   var buffer;
    //   protobuf.load("/app/common/"MineMqttMessage.proto, function (err, root) {
    //          if (err) throw err;
    //          WSMessage = root.lookup("mineProto.MineMqttMessage");
    //          buffer = WSMessage.encode(message.payloadBytes);
    //          console.log(buffer.type);
    //          var me = root.lookup("")
    //   });
    //
    //
    // };


    //发送消息
    // var message = new Paho.MQTT.Message("hello");
    // message.destinationName = "/topic";
    // client.send(message);


    /**
     * 加载作业面列表
     */
    vm.getWorkFaceList = function () {
      var rspDate = serviceResource.restCallService(MINEMNG_WORKFACE_LIST, "QUERY");
      rspDate.then(function (data) {
        vm.workFaceList = data;
      }, function (reason) {
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
      }, function (reason) {
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
      }, function (reason) {
        Notification.error(reason.data);
      })
    };
    vm.getFleetList();

    /**
     * 加载小组列表
     * @param fleetId
     */
    vm.getTeamList = function (fleetId) {
      vm.teamList = null;
      vm.totalDispatch.team = null;
      if(fleetId != null && fleetId !== "" && fleetId !== "undefined") {
        var url = MINEMNG_FLEET_LIST + "?parentId=" + fleetId;
        var rspDate = serviceResource.restCallService(url, "QUERY");
        rspDate.then(function (data) {
          vm.teamList = data;
        }, function (reason) {
          Notification.error(reason.data);
        })
      }
    };

    /**
     * 加载班次列表
     */
    vm.getWorkShiftList = function () {
      var rspDate = serviceResource.restCallService(MINEMNG_WORK_SHIFT_ALL_LIST, "QUERY");
      rspDate.then(function (data) {
        vm.workShiftList = data;
      }, function (reason) {
        Notification.error(reason.data);
      })
    };
    vm.getWorkShiftList();


    /**
     * 查询总调度
     * @param page
     * @param size
     * @param sort
     */
    vm.queryTotalDispatch = function (page, size, sort) {
      var restCallURL = MINEMNG_TOTAL_DISPATCH;
      var pageUrl = page || 0;
      var sizeUrl = size || 20;
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
          vm.totalDispatchTableParams = new NgTableParams({},
            {
              dataset: data.content
            });
          vm.totalDispatchPage = data.page;
          vm.totalDispatch_pagenumber = data.page.number + 1;
          vm.totalDispatchSelected = [];
          vm.updateTotalDispatchBtnIsShow();
        } else {
          Notification.warning(languages.findKey('noDataYet'));
          vm.totalDispatchList = null;
          vm.totalDispatchTableParams = new NgTableParams({}, {
            dataset: null
          });
          vm.totalDispatchPage.totalElements = 0;
        }
      }, function (reason) {
        Notification.error(reason);
        vm.totalDispatchList = null;
      });
    };
    vm.queryTotalDispatch(null, null, null);

    var totalDispatchSelected = function (action, id) {
      if (action === 'add' && vm.totalDispatchSelected.indexOf(id) === -1) {
        vm.totalDispatchSelected.push(id);
      }
      if (action === 'remove' && vm.totalDispatchSelected.indexOf(id) !== -1) {
        var idx = vm.totalDispatchSelected.indexOf(id);
        vm.totalDispatchSelected.splice(idx, 1);
      }
    };

    vm.totalDispatchSelection = function ($event, totalDispatch) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      totalDispatchSelected(action, totalDispatch.id);
    };

    vm.totalDispatchAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.totalDispatchList.forEach(function (totalDispatch) {
        totalDispatchSelected(action, totalDispatch.id);
      })
    };
    vm.isTotalDispatchSelected = function (totalDispatch) {
      return vm.totalDispatchSelected.indexOf(totalDispatch.id) >= 0;
    };

    /**
     * 增加总调度
     */
    vm.addTotalDispatch = function (size) {
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
        vm.queryTotalDispatch(null, null, null);
      }, function () {
        //取消
      });
    };

    /**
     * 修改总调度
     * @param totalDispatch
     * @param size
     */
    vm.updateTotalDispatch = function (totalDispatch, size) {
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
        vm.queryTotalDispatch(null, null, null);
      }, function () {
        //取消
      });
    };

    /**
     * 重置总调度搜索框
     */
    vm.resetTotalDispatch = function () {
      vm.totalDispatch = null;
    };


    /**
     * 加载车辆类型列表
     */
    // vm.getMachineTypeList = function () {
    //   var rspDate = serviceResource.restCallService(MINEMNG_MACHINE_TYPE_LIST, "QUERY");
    //   rspDate.then(function (data) {
    //     vm.machineTypeList = data;
    //   }, function (reason) {
    //     Notification.error(reason.data);
    //   })
    // };
    // vm.getMachineTypeList();

    /**
     * 切换总调度
     */
    vm.totalDispatchTab = function () {
      vm.resetTotalDispatch();
      vm.queryTotalDispatch(null, null, null);
    };

    /**
     * 切换临时调度
     */
    vm.temporaryDispatchTab = function () {
      vm.resetTemporaryDispatch();
      vm.queryTemporaryDispatch(null, null, null);
    };

    /**
     * 查询临时调度
     * @param page
     * @param size
     * @param sort
     */
    vm.queryTemporaryDispatch = function (page, size, sort) {
      var restCallURL = MINEMNG_TEMPORARY_DISPATCH;
      var pageUrl = page || 0;
      var sizeUrl = size || 20;
      var sortUrl = sort || "record_time";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (vm.temporaryDispatch != null && vm.temporaryDispatch !== '' && vm.temporaryDispatch !== 'undefined') {
        if (vm.temporaryDispatch.machineType != null && vm.temporaryDispatch.machineType !== '') {
          restCallURL += "&machineType=" + vm.temporaryDispatch.machineType;
        }
        if (vm.temporaryDispatch.carNumber != null && vm.temporaryDispatch.carNumber !== '') {
          restCallURL += "&carNumber=" + vm.temporaryDispatch.carNumber;
        }
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        if (data.content.length > 0) {
          vm.temporaryDispatchList = data.content;
          vm.temporaryDispatchTableParams = new NgTableParams({},
            {
              dataset: data.content
            });
          vm.temporaryDispatchPage = data.page;
          vm.temporaryDispatch_pagenumber = data.page.number + 1;
          vm.temporaryDispatchSelected = [];
        } else {
          Notification.warning(languages.findKey('noDataYet'));
          vm.temporaryDispatchList = null;
          vm.temporaryDispatchTableParams = new NgTableParams({}, {
            dataset: null
          });
          vm.temporaryDispatchPage.totalElements = 0;
        }
      }, function (reason) {
        Notification.error(reason);
        vm.temporaryDispatchList = null;
      });
    };


    /**
     * 新增临时调度
     * @param size
     */
    vm.addTemporaryDispatch = function (size) {
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
        vm.queryTemporaryDispatch(null, null, null);
      }, function () {
        //取消
      });
    };


    /**
     * 重置临时调度搜索框
     */
    vm.resetTemporaryDispatch = function () {
      vm.temporaryDispatch = null;
    };

  }
})();
