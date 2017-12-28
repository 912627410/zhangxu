/**
 * Created by shangyalong on 17-12-21.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('mqttws', mqttws);

  /** @ngInject */
  function mqttws($rootScope,$window, MQTT_CLIENT_HOST, MQTT_CLIENT_PORT, MQTT_CLIENT_USERNAME, MQTT_CLIENT_PASSWORD) {
    return {

      /**
       * 创建mqtt连接，并订阅主题
       * @param clientId 消息传递客户端标识符，长度介于1到23个字符之间。
       * @param topic 描述接收消息的目的地。
       * @returns {Paho.MQTT.Client}
       */
      createClient: function (clientId, topic) {//"IM.Harvesters.*"
        var client = new Paho.MQTT.Client(MQTT_CLIENT_HOST, MQTT_CLIENT_PORT, "/ws", clientId);
        client.connect({
          userName: MQTT_CLIENT_USERNAME,
          password: MQTT_CLIENT_PASSWORD,
          onSuccess: function () {
            console.log("onConnected");
            console.log(clientId);
            // debug("CONNECTION SUCCESS");
            client.subscribe(topic, {qos: 0,onSuccess:function () {
                console.log("订阅主题'"+topic+"'Success");
              }});//订阅主题
          },
          onFailure: function (message) {
            console.log("CONNECTION FAILURE - " + message.errorMessage);
            // debug("CONNECTION FAILURE - " + message.errorMessage);
          }
        });
        return client;
      }

    };
  }

})();
