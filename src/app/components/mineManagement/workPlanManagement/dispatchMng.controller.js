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

  function dispatchMngController($rootScope, $filter, $confirm, $uibModal, $scope, serviceResource, permissions, languages, Notification, mqttws,minemngResource,
                                 NgTableParams, ngTableDefaults, MINEMNG_TOTAL_DISPATCH, MINEMNG_MACHINE_TYPE_LIST, MINEMNG_TEMPORARY_DISPATCH, MINEMNG_CANCEL_TEMPORARY_DISPATCH) {
    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.sendTopic = "IM.Harvesters.";
    vm.totalDispatchShow = true;
    vm.temporaryDispatchShow = false;
    vm.selectAll = false; //是否全选标志
    vm.totalDispatchSelected = []; //选中的总调度
    vm.temporaryDispatchSelected = []; //选中的临时调度的id

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
    vm.batchUpdateTotalDispatchBtn = true; // 批量修改总调度按钮

    vm.updateTotalDispatchBtnIsShow = function() {
      if(vm.effectiveDate > getZeroDate()) {
        vm.updateTotalDispatchBtn = true;
        vm.batchUpdateTotalDispatchBtn = true;
        return;
      }
      vm.updateTotalDispatchBtn = false;
      vm.batchUpdateTotalDispatchBtn = false;
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
        } else {
          Notification.warning(languages.findKey('noDataYet'));
          vm.totalDispatchList = null;
          vm.totalDispatchTableParams = new NgTableParams({}, {
            dataset: null
          });
          vm.totalDispatchPage.totalElements = 0;
        }
        vm.updateTotalDispatchBtnIsShow();
      }, function (reason) {
        Notification.error(reason);
        vm.totalDispatchList = null;
      });
    };
    vm.queryTotalDispatch(null, null, null);

    var totalDispatchSelected = function (action, totalDispatch) {
      if (action === 'add' && vm.totalDispatchSelected.indexOf(totalDispatch) === -1) {
        vm.totalDispatchSelected.push(totalDispatch);
      }
      if (action === 'remove' && vm.totalDispatchSelected.indexOf(totalDispatch) !== -1) {
        var idx = vm.totalDispatchSelected.indexOf(totalDispatch);
        vm.totalDispatchSelected.splice(idx, 1);
      }
    };

    vm.totalDispatchSelection = function ($event, totalDispatch) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      totalDispatchSelected(action, totalDispatch);
    };

    vm.totalDispatchAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.totalDispatchList.forEach(function (totalDispatch) {
        totalDispatchSelected(action, totalDispatch);
      })
    };
    vm.isTotalDispatchSelected = function (totalDispatch) {
      return vm.totalDispatchSelected.indexOf(totalDispatch) >= 0;
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
     * 批量修改总调度
     * @param size
     */
    vm.batchUpdateTotalDispatch = function (size) {
      if(vm.totalDispatchSelected.length <= 0) {
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
            return vm.totalDispatchSelected;
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
      if (vm.temporaryDispatchCarNumber != null && vm.temporaryDispatchCarNumber !== '' && vm.temporaryDispatchCarNumber !== 'undefined') {
        restCallURL += "&carNumber=" + vm.temporaryDispatchCarNumber;
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

    // 选择临时调度
    var temporaryDispatchSelected = function (action, machineId) {
      if (action === 'add' && vm.temporaryDispatchSelected.indexOf(machineId) === -1) {
        vm.temporaryDispatchSelected.push(machineId);
      }
      if (action === 'remove' && vm.temporaryDispatchSelected.indexOf(machineId) !== -1) {
        var idx = vm.temporaryDispatchSelected.indexOf(machineId);
        vm.temporaryDispatchSelected.splice(idx, 1);
      }
    };
    vm.temporaryDispatchSelection = function ($event, temporaryDispatch) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      temporaryDispatchSelected(action, temporaryDispatch.minemngMachineId);
    };
    vm.temporaryDispatchAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.temporaryDispatchList.forEach(function (temporaryDispatch) {
        temporaryDispatchSelected(action, temporaryDispatch.minemngMachineId);
      })
    };
    vm.isTemporaryDispatchSelected = function (temporaryDispatch) {
      return vm.temporaryDispatchSelected.indexOf(temporaryDispatch.minemngMachineId) >= 0;
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
     * 修改临时调度
     * @param temporaryDispatch
     * @param size
     */
    vm.updateTemporaryDispatch = function (temporaryDispatch, size) {
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
        vm.queryTemporaryDispatch(null, null, null);
      }, function () {
        //取消
      });
    };

    vm.cancelTemporaryDispatch = function (machineId) {
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
            vm.queryTemporaryDispatch(null, null, null);
          } else{
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data);
        });
      });
    };

    vm.batchCancelTemporaryDispatch = function () {
      if(vm.temporaryDispatchSelected.length <= 0) {
        Notification.warning("请选择需要取消的记录");
        return;
      }
      $confirm({
        text: "确定要批量取消调度吗？",
        title: "批量取消调度",
        ok: languages.findKey('confirm'),
        cancel:languages.findKey('cancel')
      }).then(function () {
        var restPromise = serviceResource.restUpdateRequest(MINEMNG_CANCEL_TEMPORARY_DISPATCH, vm.temporaryDispatchSelected);
        restPromise.then(function (data) {
          if(data.code === 0) {
            Notification.success(data.content);
            vm.queryTemporaryDispatch(null, null, null);
          } else{
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data);
        });
      });
    };

    /**
     * 重置临时调度搜索框
     */
    vm.resetTemporaryDispatch = function () {
      vm.temporaryDispatchCarNumber = null;
    };

  }
})();
