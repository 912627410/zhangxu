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

  function dispatchMngController($rootScope, $filter, $confirm, $uibModal, $scope, serviceResource, permissions, languages, Notification, mqttws) {
    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.sendTopic = "IM.Harvesters.";

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

  }
})();
