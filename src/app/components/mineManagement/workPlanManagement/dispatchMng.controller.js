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
                                   MINEMNG_DISPATCH_SEND, MINEMNG_WORKFACE_LIST, MINEMNG_DUMP_FIELD_LIST, MINEMNG_FLEET_LIST,MINEMNG_WORK_SHIFT_LIST,
                                   MINEMNG_TOTAL_DISPATCH, MINEMNG_SEND_TOTAL_DISPATCH) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.sendTopic = "IM.Harvesters.";
      vm.totalDispatchShow = true;
      vm.temporaryDispatchShow = false;


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
      vm.getWorkfaceList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_WORKFACE_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.workfaceList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getWorkfaceList();

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
        var url = MINEMNG_FLEET_LIST + "?parentId=" + fleetId;
        var rspDate = serviceResource.restCallService(url, "QUERY");
        rspDate.then(function (data) {
          vm.teamList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
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


      /**
       * 查询总调度
       * @param page
       * @param size
       * @param sort
       */
      vm.queryTotalDispatch = function (page,size,sort) {
        var restCallURL = MINEMNG_TOTAL_DISPATCH;
        var pageUrl = page || 0;
        var sizeUrl = size || 20;
        var sortUrl = sort || "record_time";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

        if(vm.totalDispatch != null && vm.totalDispatch !== '' && vm.totalDispatch !== 'undefined') {
          if(vm.totalDispatch.fleet != null && vm.totalDispatch.fleet !== '') {
            restCallURL += "&fleet=" + vm.totalDispatch.fleet;
          }
          if(vm.totalDispatch.team != null && vm.totalDispatch.team !== '') {
            restCallURL += "&team=" + vm.totalDispatch.team;
          }
          if(vm.totalDispatch.workface != null && vm.totalDispatch.workface !== '') {
            restCallURL += "&workface=" + vm.totalDispatch.workface;
          }
          if(vm.totalDispatch.dumpField != null && vm.totalDispatch.dumpField !== '') {
            restCallURL += "&dumpField=" + vm.totalDispatch.dumpField;
          }
          if(vm.totalDispatch.workShift != null && vm.totalDispatch.workShift !== '') {
            restCallURL += "&workShift=" + vm.totalDispatch.workShift;
          }
        }

        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function(data){
          if(data.content.length>0){
            vm.totalDispatchList = data.content;
            vm.totalDispatchPage = data.page;
            vm.totalDispatch_pagenumber = data.page.number + 1;
          } else {
            Notification.warning(languages.findKey('noDataYet'));
            vm.totalDispatchList = null;
          }
        },function(reason){
          Notification.error(reason);
          vm.totalDispatchList = null;
        });
      };
      vm.queryTotalDispatch(null, null, null);

      /**
       * 增加总调度
       */
      vm.addTotalDispatch = function (size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/workPlanManagement/newTotalDispatch.html',
          controller: 'newTotalDispatchController as newTotalDispatchCtrl',
          size: size,
          backdrop:false,
          scope:$scope,
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
       * 刪除总调度
       */
      vm.deleteTotalDispatch = function (id) {
        $confirm({
          title: "删除",
          text: "确定删除?"
        }).then(function () {
          var restPromise = serviceResource.restUpdateRequest(MINEMNG_TOTAL_DISPATCH, id);
          restPromise.then(function (data) {
            if(data.code === 0) {
              Notification.success(data.content);
              vm.queryTotalDispatch();
            } else{
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(reason.data);
          });
        })
      };

      /**
       * 发布总调度命令
       * @param id
       */
      vm.sendTotalDispatch = function (id) {
        $confirm({
          title: "发布",
          text: "确定发布?"
        }).then(function () {
          var restURL = MINEMNG_SEND_TOTAL_DISPATCH + "?id=" + id;
          var rspData = serviceResource.restCallService(restURL, "ADD", null);
          rspData.then(function (data) {
            if(data.code === 0) {
              Notification.success(data.content);
              vm.queryTotalDispatch();
            } else{
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(reason.data);
          });
        })
      };


      vm.dispatch = function () {
        var restPromise = serviceResource.restUpdateRequest(MINEMNG_DISPATCH_SEND, vm.sendTopic);
        restPromise.then(function (data) {
          Notification.success(data.content);
        }, function (reason) {
          Notification.error(reason.message);
        });
      };


      /**
       * 重置总调度下拉框
       */
      vm.resetTotalDispatch = function () {
        vm.totalDispatch = null;
      };

    }
})();
