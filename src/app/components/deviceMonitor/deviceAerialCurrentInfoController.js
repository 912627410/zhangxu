(function () {
    'use strict';
    angular
        .module('GPSCloud')
        .controller('deviceAerialCurrentInfoController', deviceAerialCurrentInfoController);

    /** @ngInject */
    function deviceAerialCurrentInfoController($rootScope, $scope,$http, $location, $timeout, $filter, $uibModalInstance, $confirm,ngTableDefaults,$window,
                                               Notification, serviceResource, DEVCE_LOCK_DATA_PAGED_QUERY, DEIVCIE_UNLOCK_FACTOR_URL,DEVCE_DATA_PAGED_QUERY,BATTERY_CHART_DATA,BATTERY_FORM_DATA,
                                               VIEW_SMS_EMCLOUD_URL,AMAP_GEO_CODER_URL,MACHINE_FENCE,deviceinfo,DEVCE_CHARGER_DATA,DEVCEINFO_PARAMETER_URL, NgTableParams,
                                               DEVCEMONITOR_SIMPLE_DATA_PAGED_QUERY,DEVCEMONITOR_WARNING_DATA_PAGED_QUERY,MACHINE_FENCE_CACHE,DEVCEDATA_EXCELEXPORT,
                                               languages,SET_MQTT_RETURN_TIME_URL,SEND_MQTT_READ_URL,SEND_MQTT_WRITE_URL,GET_MQTT_RETURN_TIME,SEND_MQTT_OPERATED_URL,
                                               DEVCEINFO_CALIBRATION_PARAMETER_URL,CALIBRATION_PARAMETER_EXPORT,WEBSOCKET_URL,$uibModal,SEND_SET_IP_SMS_URL,SEND_SET_INTER_SMS_URL,
                                               SEND_SET_START_TIMES_SMS_URL,SEND_SET_WORK_HOURS_SMS_URL,SEND_ACTIVE_SMS_URL,SEND_UN_ACTIVE_LOCK_SMS_URL,SEND_LOCK_SMS_URL,
                                               SEND_UN_LOCK_SMS_URL,SEND_SET_SAMPLING_TIME_SMS_URL,SEND_SET_CAT_PHONE_NUMBER_SMS_URL,SEND_TERMINAL_RESET_SMS_URL,MQTT_SEND_RECORD_PAGED_QUERY) {
        var vm = this;

        var userInfo = $rootScope.userInfo;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceinfo = deviceinfo;
        vm.deviceinfo.produceDate = new Date(vm.deviceinfo.produceDate);  //必须重新生成date object，否则页面报错
        //运行总时间
        //改为过滤器
        //vm.deviceinfo.workDuration=serviceResource.convertToMins(vm.deviceinfo.workDuration);
        vm.deviceinfo.oilPressure=serviceResource.convertTooilPressure(vm.deviceinfo.oilPressure);
        vm.deviceinfo.batteryPower=serviceResource.convertTobatteryPower(vm.deviceinfo.batteryPower);
        vm.deviceinfo.gsmsignalStrength=serviceResource.convertGSMSing(vm.deviceinfo.gsmsignalStrength);

        vm.scopeMap;
        vm.locationList=[];
        vm.selectPosition;
        vm.selectAddress=''; //选中的地址信息
        vm.amaplongitudeNum;//选中的经度
        vm.amaplatitudeNum;//选中的维度
        vm.radius = 100; //设置的半径,默认100米
        vm.zoomsize = 8;
        vm.uploadNum = 1;// 默认上传次数1
        vm.uploadFrequency = 2;// 默认上传频率2s
        vm.faultCommand = 39; //默认故障命令为39
        vm.parameterType = 0; // 默认车辆参数类型0
        vm.latestAlarmInfo = serviceResource.getWarningInfo(vm.deviceinfo.warningCode).description;

        vm.staticNoLoadImportValue = null; //静态空载参数导入值
        vm.staticFullLoadImportValue = null; //静态满载参数导入值
        vm.dynamicNoLoadImportValue = null; //动态空载参数导入值
        vm.dynamicFullLoadImportValue = null; //动态满载参数导入值


        var ws;//websocket实例
        var lockReconnect = false;//避免重复连接
        var wsUrl = WEBSOCKET_URL + "webSocketServer/mqttSendStatus?token=" + vm.operatorInfo.authtoken;
        var heartBeatMsg = "HeartBeat"; //心跳消息
        vm.createWebSocket = function(url) {
          try {
            ws = new WebSocket(url);
            initEventHandle();
          } catch (e) {
            reconnect(url);
          }
        };
        var initEventHandle = function() {
          ws.onclose = function () {
            reconnect(wsUrl);
          };
          ws.onerror = function () {
            reconnect(wsUrl);
          };
          ws.onopen = function () {
            //心跳检测重置
            heartCheck.reset().start();
          };
          ws.onmessage = function (evt) {
            //如果获取到消息，心跳检测重置
            //拿到任何消息都说明当前连接是正常的
            heartCheck.reset().start();
            if(evt.data == heartBeatMsg) {
              //心跳响应
              // console.log("心跳响应:" + evt.data);
            } else {
              if(evt.data == 0) {
                Notification.success(languages.findKey('successfulOperation'));
              } else {
                Notification.error(languages.findKey('operationFailed')+':'+evt.data);
              }
            }
          }
        };
        var reconnect = function(url) {
          if(lockReconnect) return;
          lockReconnect = true;
          //没连接上会一直重连，设置延迟避免请求过多
          vm.reconnectTimeOut = setTimeout(function () {
            vm.createWebSocket(url);
            lockReconnect = false;
          }, 3000);
        };
        //心跳检测
        var heartCheck = {
          timeout: 60000,//60秒
          timeoutObj: null,
          reset: function(){
            clearTimeout(this.timeoutObj);
            return this;
          },
          start: function(){
            this.timeoutObj = setTimeout(function(){
              //这里发送一个心跳，后端收到后，返回一个心跳消息，
              //onmessage拿到返回的心跳就说明连接正常
              ws.send(heartBeatMsg);
            }, this.timeout)
          }
        };
        $scope.$on("$destroy",function () {
          if(ws) {
            ws.close();
            heartCheck.reset();
            clearTimeout(vm.reconnectTimeOut);
            lockReconnect = true;
          }
        });
        if(vm.deviceinfo.versionNum == '11') {
          vm.createWebSocket(wsUrl);
        }

        // 短信发送成功后的初始化button
        vm.initSmsSendBtn = function () {
          $window.sessionStorage["sendBtnStatus"] = true;
          $window.sessionStorage["sendBtnTime"] = 20000;
          $window.sessionStorage["sendDeviceNum"] = vm.deviceinfo.deviceNum;
          vm.sendBtnShow = true;
        };

        if(deviceinfo.machine!=null&&deviceinfo.machine.selectAddress!=null
            &&deviceinfo.machine.amaplongitudeNum!=null&&deviceinfo.machine.amaplatitudeNum!=null
            &&deviceinfo.machine.radius!=null){
            vm.selectAddress=deviceinfo.machine.selectAddress; //选中的地址信息
            vm.amaplongitudeNum=deviceinfo.machine.amaplongitudeNum;//选中的经度
            vm.amaplatitudeNum=deviceinfo.machine.amaplatitudeNum;//选中的维度
            vm.radius=deviceinfo.machine.radius; //设置的半径
        }

        //未标定时,负载重量和平台高度显示为-
        if(vm.deviceinfo.calibrationStatus == 192) {
          if(null == vm.deviceinfo.loadWeight || vm.deviceinfo.loadWeight > 100 || vm.deviceinfo.loadWeight < 0) {
            vm.deviceinfo.loadWeight = '-';
          } else {
            vm.deviceinfo.loadWeight += '%';
          }
          if(null == vm.deviceinfo.hostHeight || vm.deviceinfo.hostHeight > 100 || vm.deviceinfo.hostHeight < 0) {
            vm.deviceinfo.hostHeight = '-';
          } else {
            vm.deviceinfo.hostHeight += '%';
          }
        } else {
          vm.deviceinfo.loadWeight = "-";
          vm.deviceinfo.hostHeight = "-";
        }

      /**
       * PCU状态
       * 行走模式-右转-左转-中位-前进、后退
       * 升降模式-中位-举升、下降
       */
        if(null != vm.deviceinfo.pcuStatus && vm.deviceinfo.pcuStatus.length == 8) {
          var pcuStatus = vm.deviceinfo.pcuStatus;
          if(pcuStatus.substring(1,2) == "0") {
            if(pcuStatus.substring(4,5) == "0") {
              if(pcuStatus.substring(5,6) == "0") {
                if(pcuStatus.substring(6,7) == "0") {
                  if(pcuStatus.substring(7,8) == "0") {
                    vm.pcuStatusDesc = languages.findKey('retreat');
                  } else if(pcuStatus.substring(7,8) == "1") {
                    vm.pcuStatusDesc = languages.findKey('advance');
                  }
                } else if(pcuStatus.substring(6,7) == "1") {
                  vm.pcuStatusDesc = languages.findKey('not');
                }
              } else if(pcuStatus.substring(5,6) == "1") {
                vm.pcuStatusDesc = languages.findKey('turnLeft');
              }
            } else if(pcuStatus.substring(4,5) == "1") {
              vm.pcuStatusDesc = languages.findKey('turnRight');
            }
          } else if(pcuStatus.substring(1,2) == "1") {
            if(pcuStatus.substring(6,7) == "0") {
              if(pcuStatus.substring(7,8) == "0") {
                vm.pcuStatusDesc = languages.findKey('decline');
              } else if(pcuStatus.substring(7,8) == "1") {
                vm.pcuStatusDesc = languages.findKey('liftUp');
              }
            } else if(pcuStatus.substring(6, 7) == "1") {
              vm.pcuStatusDesc = languages.findKey('not');
            }
          }
        }

        if (vm.deviceinfo.calibrationVisible=='1'){//由于硬件bug,标定状态特定的车改成标定成功。0代表没有bug，1代表有bug，页面需要显示标定成功 by xielong.wang 2017-07-07
          vm.deviceinfo.calibrationStatus= "标定成功";
        }else {
          if (vm.deviceinfo.calibrationStatus!=null){
            switch(vm.deviceinfo.calibrationStatus){
              case 128:
                vm.deviceinfo.calibrationStatus = "满载标定成功,空载未标定";
                break;
              case 64:
                vm.deviceinfo.calibrationStatus = "空载标定成功,满载未标定";
                break;
              case 192:
                vm.deviceinfo.calibrationStatus = "标定成功（满载和空载）";
                break;
              case 32:
                vm.deviceinfo.calibrationStatus = "未标定";
                break;
              case 33:
                vm.deviceinfo.calibrationStatus = "失败,压力传感器值过大";
                break;
              case 34:
                vm.deviceinfo.calibrationStatus = "失败,压力传感器值过小";
                break;
              case 36:
                vm.deviceinfo.calibrationStatus = "失败,角度传感器值过大";
                break;
              case 40:
                vm.deviceinfo.calibrationStatus = "失败,角度传感器值过小";
                break;
              default:
                vm.deviceinfo.calibrationStatus = "标定失败";
            }
          }
        }


        vm.highchartsPower = {
            options: {
                chart: {
                    type: 'solidgauge'
                },

                title: null,

                pane: {
                    center: ['50%', '50%'],
                    size: '100%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                    }
                },

                tooltip: {
                    enabled: false
                },

                // the value axis
                yAxis: {
                    stops: [
                        [0.1, '#55BF3B'], // green
                        [0.5, '#DDDF0D'], // yellow
                        [0.9, '#DF5353'] // red
                    ],
                    lineWidth: 0,
                    minorTickInterval: null,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    title: {
                        y: -70
                    },
                    labels: {
                        y: 16
                    }
                },
                credits: {
                    enabled: false
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                }
            },
            title: languages.findKey('voltage'),
            yAxis: {
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.5, '#DDDF0D'], // yellow
                    [0.9, '#DF5353'] // red
                ],
                lineWidth: 0,
                minorTickInterval: null,
                tickPixelInterval: 400,
                tickWidth: 0,

                labels: {
                    y: 16
                },
                min: 0,
                max: 200,
                title: {
                    text: '电量'
                }
            },
            series: [{
                name: 'Power',
                data: [80],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                    '<span style="font-size:12px;color:silver">伏特</span></div>'
                },
                tooltip: {
                    valueSuffix: ' km/h'
                }
            }],

            loading: false,
            func: function (chart) {
                $timeout(function () {
                    chart.reflow();
                    //The below is an event that will trigger all instances of charts to reflow
                    //vm.$broadcast('highchartsng.reflow');
                }, 0);
                setInterval(function () {
                    // Speed
                    var chart = $('#VU_meter').highcharts(),
                        point,
                        newVal,
                        inc;

                    if (chart) {
                        point = chart.series[0].points[0];
                        inc = Math.round((Math.random() - 0.5) * 100);
                        newVal = point.y + inc;

                        if (newVal < 0 || newVal > 200) {
                            newVal = point.y - inc;
                        }

                        point.update(newVal);
                    }
                }, 2000);

            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };


        //******************远程控制tab**********************]
        vm.serverHost = vm.deviceinfo.mainGatewayIp == null ? "iot.nvr-china.com" : vm.deviceinfo.mainGatewayIp;
        vm.serverPort = vm.deviceinfo.mainGatewayPort == null ? "08090" : vm.deviceinfo.mainGatewayPort;
        vm.startTimes = vm.deviceinfo.startTimes;
        vm.catPhoneNumber='13853108000';
        vm.workHours = $filter('number')(vm.deviceinfo.workDuration, 1);
        if (vm.workHours != null) {
            vm.workHours = vm.workHours.replace(/,/g, '');  //去掉千位分隔符
        }
        //vm.secOutPower =
        //secLocateInt
        //secInnerPower
      vm.getDeviceUnlockFactor = function () {
        ////读取初始化设备时需要的信息
        var restURL = DEIVCIE_UNLOCK_FACTOR_URL + "?deviceNum=" + vm.deviceinfo.deviceNum;

        var rspData = serviceResource.restCallService(restURL, "GET");
        rspData.then(function (data) {
          vm.deviceUnLockFactor = data.content;
          var licenseId = vm.deviceUnLockFactor.licenseId;
          //具体格式请参考短信激活文档
        }, function (reason) {
          Notification.error('获取信息失败');
        })
      }

        //检查短信参数
        vm.checkParam = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt,secInnerPower,catPhoneNumber,vehicleStateCollect,chargerStateCollect) {
            if (type == null || devicenum == null) {
                return false;
            }
            //type == 5表示设置回传地址
            if (type == 5 && (host == null || port == null)) {
                return false;
            }
            //type == 6表示设置启动次数
            if (type == 6 && startTimes == null) {
                return false;
            }
            //type == 7表示设置工作小时数
            if (type == 7 && workHours == null) {
                return false;
            }
            //type == 8表示设置各间隔时间
            if (type == 8 && (secOutsidePower == null || secLocateInt == null || secInnerPower == null)) {
                return false;
            }
            if (type == 11 && (vehicleStateCollect == null || chargerStateCollect == null )){
                return false;
            }
            return true;
        }

        //将短信赋值给相应的变量
        vm.assginSMSContent = function (type, sms) {
            if (type == 1) {
                vm.activeMsg = sms;
            }
            else if (type == 2) {
                vm.unActiveMsg = sms;
            }
            else if (type == 3) {
                vm.lockMsg = sms;
            }
            else if (type == 4) {
                vm.unLockMsg = sms;
            }
            else if (type == 5) {
                vm.setIpMsg = sms;
            }
            else if (type == 6) {
                vm.setStartTImesMsg = sms;
            }
            else if (type == 7) {
                vm.setWorkHoursMsg = sms;
            }
            else if (type == 8) {
                vm.setWorkIntMsg = sms;
            }else if(type == 9){
                vm.setCatPhoneNumberMsg=sms;
            }else if(type == 10){
                vm.terminalReset=sms;
            } else if (type==11){
                vm.setCollectIntMsg=sms;
            }
        }

        //得到短信内容
        vm.viewSMS = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber,vehicleStateCollect,chargerStateCollect) {


          if (vm.checkParam(type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber,vehicleStateCollect,chargerStateCollect) == false) {
                Notification.error("请提供要设置的参数");
                return;
            }
            var restURL = VIEW_SMS_EMCLOUD_URL + "?type=" + type + "&devicenum=" + devicenum;
            if (type == 5) {
                restURL += "&host=" + host + "&port=" + port;
            }
            else if (type == 6) {
                restURL += "&startTimes=" + startTimes;
            }
            else if (type == 7) {
                restURL += "&workHours=" + workHours;
            }
            else if (type == 8) {
                restURL += "&secOutsidePower=" + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;
            }else if(type == 9){
                restURL += "&catPhoneNumber=" + catPhoneNumber;
            }else if (type==11){
              if(vehicleStateCollect<10||vehicleStateCollect>180 || chargerStateCollect<10||chargerStateCollect>180){
                Notification.error("请输入正确的采样时间范围10~180秒");
                return;
              }
              restURL += "&vehicleStateCollect=" + vehicleStateCollect + "&chargerStateCollect=" + chargerStateCollect;
            }
            var rspData = serviceResource.restCallService(restURL, "GET");
            rspData.then(function (data) {
                vm.assginSMSContent(type, data.content);
            }, function (reason) {
                Notification.error('获取短信内容失败,' + reason.data.message);
            })
        }

        //发送短信
      // 原高空车短信下发,现在已弃用
        /*vm.sendSMS = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber,vehicleStateCollect,chargerStateCollect) {

            if (vm.checkParam(type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber,vehicleStateCollect,chargerStateCollect) == false) {
                Notification.error("请提供要设置的参数");
                return;
            }
            var restURL = SEND_SMS_EMCLOUD_URL + "?type=" + type + "&devicenum=" + devicenum;
            if (type == 5) {
                restURL += "&host=" + host + "&port=" + port;
            }
            else if (type == 6) {
                restURL += "&startTimes=" + startTimes;
            }
            else if (type == 7) {
                restURL += "&workHours=" + workHours;
            }
            else if (type == 8) {
                restURL += "&secOutsidePower=" + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;
            }
            else if(type == 9){
                restURL += "&catPhoneNumber=" + catPhoneNumber;
            }else if (type==11){
              if(vehicleStateCollect<10||vehicleStateCollect>180 || chargerStateCollect<10||chargerStateCollect>180){
                Notification.error("请输入正确的采样时间范围10~180秒");
                return;
              }
                restURL += "&vehicleStateCollect=" + vehicleStateCollect + "&chargerStateCollect=" + chargerStateCollect;
            }
            $confirm({text: '确定要发送此短信吗?', title: '短信发送确认', ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
                .then(function () {
                    var rspData = serviceResource.restCallService(restURL, "ADD");  //post请求
                    rspData.then(function (data) {
                        if (data.code == 0 && data.content.smsStatus == 0) {
                            vm.assginSMSContent(type, data.content.smsContent);
                            Notification.success("短信已发送成功");
                        }
                        else {
                            Notification.error("短信发送出错");
                        }
                    }, function (reason) {
                        Notification.error("短信发送出错");
                    })
                });
        }*/

      //发送回传地址信息
      vm.sendSetIpSMS = function (devicenum, host, port) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_SET_IP_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&host=" + host + "&port=" + port;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送间隔信息
      vm.sendSetInterSMS = function (devicenum, secOutsidePower, secLocateInt, secInnerPower) {
        if(angular.isUndefined(secOutsidePower) ||angular.isUndefined(secLocateInt)||angular.isUndefined(secInnerPower) ){
          Notification.error(languages.findKey('checktheTimeSettingsFullySet'));
          return;
        }
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_SET_INTER_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&secOutsidePower="
          + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送启动次数信息
      vm.sendSetStartTimesSMS = function (devicenum, startTimes) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_SET_START_TIMES_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&startTimes=" + startTimes;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送工作小时数
      vm.sendSetWorkHoursSMS = function (devicenum, workHours) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_SET_WORK_HOURS_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&workHours=" + workHours;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送绑定短信
      vm.sendActiveLockSMS = function (devicenum) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_ACTIVE_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送解绑短信
      vm.sendUnActiveLockSMS = function (devicenum) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_UN_ACTIVE_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送锁车短信
      vm.sendLockSMS = function (devicenum) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送解锁短信
      vm.sendUnLockSMS = function (devicenum) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_UN_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送采样时间
      vm.sendSamplingTimeSMS = function (devicenum, vehicleStateCollect, chargerStateCollect) {
        if(angular.isUndefined(vehicleStateCollect) ||angular.isUndefined(chargerStateCollect)){
          Notification.error(languages.findKey('checktheTimeSettingsFullySet'));
          return;
        }
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_SET_SAMPLING_TIME_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&vehicleStateCollect="
          + vehicleStateCollect + "&chargerStateCollect=" + chargerStateCollect;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送平台短信猫号码
      vm.sendSetCatPhoneNumberSMS = function (devicenum, catPhoneNumber) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_SET_CAT_PHONE_NUMBER_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&catPhoneNumber=" + catPhoneNumber;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

      //发送终端复位短信
      vm.sendTerminalResetSMS = function (devicenum) {
        if (devicenum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restURL = SEND_TERMINAL_RESET_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

        $confirm({
          text: languages.findKey('youSureYouWantToSendThisMessage') + '',
          title: languages.findKey('SMSConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        })
          .then(function () {
            var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
            rspData.then(function (data) {
              if(data.code == 0){
                if(data.content.smsStatus == 0){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success(data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else if(data.content.smsStatus == 18){
                  vm.activeMsg = data.content.smsContent;
                  Notification.success("短信已提交短信平台"+ data.content.resultDescribe);
                  vm.initSmsSendBtn();
                } else {
                  Notification.error(data.content.resultDescribe);
                }
              } else {
                Notification.error(data.content.message);
              }
            }, function (reason) {
              Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
            })
          });
      };

        /**
         * MQTT下发操作命令
         * @param type 类型
         * @param deviceNum 设备号
         * @param faultCommand 故障屏蔽码
         */
        vm.sendMQTTOperated = function (type, deviceNum, faultCommand) {
          if(null == deviceNum || deviceNum == '') {
            Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
            return;
          }
          var restURL = SEND_MQTT_OPERATED_URL + "?type="+ type + "&deviceNum=" + deviceNum + "&faultCommand=" + faultCommand;
          $confirm({
            text: languages.findKey('确定发送此命令?') + '',
            title: languages.findKey('发送命令确认') + '',
            ok: languages.findKey('confirm') + '',
            cancel: languages.findKey('cancel') + ''
          }).then(function () {
            var restPromise = serviceResource.restCallService(restURL, "ADD", null);
            restPromise.then(function (data) {
              if (data.code == 0) {
                vm.initSmsSendBtn();
              }
              else {
                Notification.error(data.content);
              }
            }, function (reason) {
              Notification.error(languages.findKey('sendFiled') + ": " + reason.data.message);
            })
          });
        };

        /**
         * MQTT下发写命令
         * @param type 类型
         * @param deviceNum 设备号
         * @param content 内容
         */
        vm.sendMQTTWrite = function (type, deviceNum, content) {
          if(null == deviceNum || deviceNum == '') {
            Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
            return;
          }
          if(type == 18 && null != content) { // 回传地址
            var port = content.split(",")[1];
            if(port > 65535) {
              Notification.error(languages.findKey('maxPortError'));
              return;
            }
          }
          if(type == 34) { // MQTT设置工作小时数
            if(null == content || content=="") {
              Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
              return;
            }
            content = Math.round(content*60/5);
          }
          var restURL = SEND_MQTT_WRITE_URL + "?type="+ type + "&deviceNum=" + deviceNum;
          if(null != content) {
            restURL += "&content=" + content;
          }
          $confirm({
            text: languages.findKey('确定发送此命令?') + '',
            title: languages.findKey('发送命令确认') + '',
            ok: languages.findKey('confirm') + '',
            cancel: languages.findKey('cancel') + ''
          }).then(function () {
            var restPromise = serviceResource.restCallService(restURL, "ADD", null);
            restPromise.then(function (data) {
              if (data.code == 0) {
                vm.initSmsSendBtn();
              }
              else {
                Notification.error(data.content);
              }
            }, function (reason) {
              Notification.error(languages.findKey('sendFiled') + ": " + reason.data.message);
            })
          });
        };

        //默认显示当前设备的最新地址
        vm.initMapTab = function(deviceInfo){

            $timeout(function(){
                var deviceInfoList = new Array();
                deviceInfoList.push(deviceInfo);
            //    alert("deviceInfo.amaplongitudeNum=="+deviceInfo.amaplongitudeNum+", deviceInfo.amaplatitudeNum="+deviceInfo.amaplatitudeNum)
                if(null!=deviceInfo.amaplongitudeNum&null!=deviceInfo.amaplatitudeNum){
                    var centerAddr = [deviceInfo.amaplongitudeNum,deviceInfo.amaplatitudeNum];
                }


                serviceResource.refreshMapWithDeviceInfo("deviceDetailMap",deviceInfoList,17,null,centerAddr);
            })
        };

        /**
         * 得到MQTT相关回传采样时间
         * @param deviceNum 设备号
         * @param name 名称
         */
          vm.returnTimeQuery = function (deviceNum, name) {
            if (deviceNum == null) {
              Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
              return;
            }
            if(null == name || name == "") {
              return;
            }
            var restURL = GET_MQTT_RETURN_TIME + "?deviceNum=" + deviceNum + "&returnTimeName=" + name;
            var restPromise = serviceResource.restCallService(restURL, "ADD", null);
            restPromise.then(function (data) {
              if (data.code == 0) {
                vm.returnTimeParam.time = data.content;
              }
            }, function (reason) {
              Notification.error(reason.data.message);
            })
          };

      /**
       * 设置回传时间间隔
       * @param deviceNum
       * @param returnTimeParam
       */
      vm.setReturnTime = function (deviceNum, returnTimeParam) {
        if(angular.isUndefined(returnTimeParam)){
          Notification.error(languages.findKey('checktheTimeSettings'));
          return;
        }
        if (deviceNum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }

        if(null == returnTimeParam.name || "" == returnTimeParam.name) {
          Notification.error(languages.findKey('chooseTheTypeOfTimeInterval'));
          return;
        }

        if(null == returnTimeParam.time || "" == returnTimeParam.time) {
          Notification.error(languages.findKey('pleaseEnterTheTime'));
          return;
        }

        var isSend = true; // 是否发送
        //加载json,判断有效值
        $http.get('awpReturnTime.json').success(function(data){
          vm.mqttReturnTime=JSON.parse(JSON.stringify(data));
          for(var i = 0 ; i<vm.mqttReturnTime.length; i++) {
            var retrunTime = vm.mqttReturnTime[i];
            if(retrunTime.name == returnTimeParam.name) {
              if(returnTimeParam.time < retrunTime.minValue || returnTimeParam.time > retrunTime.maxValue) {
                Notification.error(languages.findKey('beyondValidRange')+":"+retrunTime.minValue+"~"+retrunTime.maxValue);
                isSend = false;
                return;
              }
            }
          }
          if(isSend) {
            var restURL = SET_MQTT_RETURN_TIME_URL + "?deviceNum="+ deviceNum + "&returnTimeName=" + returnTimeParam.name + "&returnTime=" + returnTimeParam.time;
            $confirm({
              text: languages.findKey('okSetThisInterval') + '',
              title: languages.findKey('intervalConfirmation') + '',
              ok: languages.findKey('confirm') + '',
              cancel: languages.findKey('cancel') + ''
            }).then(function () {
              var restPromise = serviceResource.restCallService(restURL, "ADD", null);
              restPromise.then(function (data) {
                if (data.code == 0) {
                  vm.initSmsSendBtn();
                }
                else {
                  Notification.error(data.content);
                }
              }, function (reason) {
                Notification.error(languages.findKey('sendFiled') + ": " + reason.data.message);
              })
            });
          }
        });
      };



      /**
       * 发送读请求命令
       * @param deviceNum
       * @param register
       * @param dataLength
       * @param uploadNum
         * @param uploadFrequency
         */
      vm.sendReadCommand = function (deviceNum, register, dataLength, uploadNum, uploadFrequency) {
        if (deviceNum == null) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        if(null == register || "" == register) {
          Notification.error(languages.findKey('pleaseEnterThe')+languages.findKey('startAddress'));
          return;
        }
        if(null == dataLength || "" == dataLength) {
          Notification.error(languages.findKey('pleaseEnterThe')+languages.findKey('dataLength'));
          return;
        }
        if(null == uploadNum || uploadNum == "") {
          Notification.error(languages.findKey('pleaseEnterThe')+languages.findKey('uploads'));
          return;
        }
        if(null == uploadFrequency || uploadFrequency == "") {
          Notification.error(languages.findKey('pleaseEnterThe')+languages.findKey('uploadFrequency'));
          return;
        } else if(uploadFrequency < 1) {
          Notification.error(languages.findKey('incorrectUploadFrequency'));
          return;
        }
        var restURL = SEND_MQTT_READ_URL + "?deviceNum="+ deviceNum + "&register=" + register + "&dataLength=" + dataLength + "&uploadNum=" + uploadNum + "&uploadFrequency=" + uploadFrequency;
        $confirm({
          text: languages.findKey('areYouSureToSendAReadRequestCommand') + '',
          title: languages.findKey('readRequestCommandConfirmation') + '',
          ok: languages.findKey('confirm') + '',
          cancel: languages.findKey('cancel') + ''
        }).then(function () {
          var restPromise = serviceResource.restCallService(restURL, "ADD", null);
          restPromise.then(function (data) {
            if (data.code == 0) {
              vm.initSmsSendBtn();
            }
            else {
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(languages.findKey('sendFiled') + ": " + reason.data.message);
          })
        });
      };

        //构造地图对象
        vm.initMap=function(mapId,zoomsize,centeraddr){
            //初始化地图对象
            if (!AMap) {
                location.reload(false);
            }
            var amapRuler, amapScale, toolBar,overView;


            var localZoomSize = 4;  //默认缩放级别
            if (zoomsize){
                localZoomSize = zoomsize;
            }

            var localCenterAddr = [103.39,36.9];//设置中心点大概在兰州附近
            if (centeraddr){
                localCenterAddr = centeraddr;
            }


            var map = new AMap.Map(mapId, {
                resizeEnable: true,
                scrollWheel: false, // 是否可通过鼠标滚轮缩放浏览
                center: localCenterAddr,
                zooms: [4, 18]
            });
            //    alert(555);
            map.setZoom(localZoomSize);
            map.plugin(['AMap.ToolBar'], function () {
                map.addControl(new AMap.ToolBar());
            });
            //加载比例尺插件
            map.plugin(["AMap.Scale"], function () {
                amapScale = new AMap.Scale();
                map.addControl(amapScale);
            });
            //添加地图类型切换插件
            map.plugin(["AMap.MapType"], function () {
                //地图类型切换
                var mapType = new AMap.MapType({
                    defaultType: 0,//默认显示卫星图
                    showRoad: false //叠加路网图层
                });
                map.addControl(mapType);
            });
            //在地图中添加ToolBar插件
            map.plugin(["AMap.ToolBar"], function () {
                toolBar = new AMap.ToolBar();
                map.addControl(toolBar);
            });

            //在地图中添加鹰眼插件
            map.plugin(["AMap.OverView"], function () {
                //加载鹰眼
                overView = new AMap.OverView({
                    visible: true //初始化隐藏鹰眼
                });
                map.addControl(overView);
            });

          //在地图中添加圆编辑插件
          map.plugin(['AMap.CircleEditor'], function () {
          });

          //在地图中添加地理编码插件
          map.plugin(['AMap.Geocoder'], function () {

          });

          map.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], function () {
            var autoOptions = {
              city: "北京", //城市，默认全国
              input: "tipinput"//使用联想输入的input的id
            };
            var auto= new AMap.Autocomplete(autoOptions);
            var placeSearch = new AMap.PlaceSearch({
              city:'北京',
              map:map
            });
            AMap.event.addListener(auto, "select", function(e){
              //TODO 针对选中的poi实现自己的功能
              placeSearch.search(e.poi.name,function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                  vm.placeSearch_CallBack(result);
                }
              });
              //回调函数

            });
          });

            vm.scopeMap=map;
            return map;
        };


      vm.placeSearch_CallBack = function (data) {
        var poiArr = data.poiList.pois;

        if(poiArr.length >0){
          var  lnglatXY=[poiArr[0].location.getLng(), poiArr[0].location.getLat()];
          vm.updateLocationInfo(poiArr[0].address, lnglatXY); //更新选中的地址信息

        }

      }



      vm.updateLocationInfo=function(address,location){
            vm.selectAddress=address;

            vm.amaplongitudeNum=location[0];//选中的经度
            vm.amaplatitudeNum=location[1];//选中的维度

            $scope.$apply();


        };

      /**
       * 在地图上画圆
       * @param position
       * @returns {*}
         */
      var createCircle = function (position) {
        return new AMap.Circle({
          center: position,// 圆心位置
          radius: vm.radius, //半径
          strokeColor: "#F33", //线颜色
          strokeOpacity: 1, //线透明度
          strokeWeight: 3, //线粗细度
          fillColor: "#ee2200", //填充颜色
          fillOpacity: 0.35 //填充透明度
        });
      };

        //查询设备数据并更新地图 mapid是DOM中地图放置位置的id
        vm.refreshScopeMapWithDeviceInfo=function (mapId,deviceInfo,zoomsize,centeraddr) {
            //保存之前的标注
            var beforMarkers = [];
            $LAB.script(AMAP_GEO_CODER_URL).wait(function () {

                var map=vm.initMap(mapId,zoomsize,centeraddr);

                map.on('click', function(e) {
                    var  lnglatXY=[e.lnglat.getLng(), e.lnglat.getLat()];
                    vm.amaplongitudeNum = e.lnglat.getLng();
                    vm.amaplatitudeNum = e.lnglat.getLat();

                    var geocoder = new AMap.Geocoder({
                      radius: 100,
                      extensions: "all"
                    });

                    geocoder.getAddress(lnglatXY, function(status, result) {
                      if (status === 'complete' && result.info === 'OK') {
                        var  address= result.regeocode.formattedAddress; //返回地址描述
                        vm.updateLocationInfo(address, lnglatXY);
                      }
                    });

                    vm.echoFence(map);

                });


                //读取所有设备的gps信息，home map使用
                if ((deviceInfo.locateStatus === '1' || deviceInfo.locateStatus === 'A' || deviceInfo.locateStatus === 'B') && deviceInfo.amaplongitudeNum != null && deviceInfo.amaplatitudeNum != null) {
                  vm.addMarkerModelEmcloud(map,deviceInfo,"https://webapi.amap.com/images/marker_sprite.png");
                }

                vm.echoFence(map);



            })
        };
        var circles=[]; //存放生成的圆
        var circleEditorList=[]; //存放生成的圆编辑器
          /**
           * 回显电子围栏
           * @param map map
             */
          vm.echoFence = function(map) {

            //每次操作时候,如果圆的个数大于0,则移除第一个圆和圆编辑器
            if(circleEditorList.length>0){
              map.remove(circles[0]);
              circles.pop();

              circleEditorList[0].close();
              circleEditorList.pop();

            }
            //回显围栏坐标
            if(vm.amaplongitudeNum!=null&&vm.amaplatitudeNum!=null){
              var lnglatXY=[vm.amaplongitudeNum, vm.amaplatitudeNum];

              var circle = createCircle(lnglatXY);
              circle.setMap(map);

              var circleEditor = new AMap.CircleEditor(map, circle);

              AMap.event.addListener(circleEditor, "move", function (e) {
                var location = [e.lnglat.lng, e.lnglat.lat];
                var geocoder = new AMap.Geocoder({

                });
                geocoder.getAddress(location, function (status, result) {
                  if(status === 'complete' && result.info === 'OK') {
                    vm.updateLocationInfo(result.regeocode.formattedAddress, location);
                  }
                });
              });

              AMap.event.addListener(circleEditor, "adjust" ,function (e) {
                vm.radius = e.radius;
                $scope.$apply();
              });

              circleEditor.open();
              circles.push(circle);
              circleEditorList.push(circleEditor);

            }
          };

      vm.addMarkerModelEmcloud = function (mapObj, item, icon) {
        var mapObj = mapObj;
        //实例化信息窗体
        var infoWindow = new AMap.InfoWindow({
          isCustom: true,  //使用自定义窗体
          offset: new AMap.Pixel(15, -40)//-113, -140
        });
        var marker = new AMap.Marker({
          map: mapObj,
          position: new AMap.LngLat(item.amaplongitudeNum, item.amaplatitudeNum), //基点位置
          icon: icon //复杂图标
        });
        AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
          infoWindow.open(mapObj, marker.getPosition());
          var title = item.deviceNum;
          var contentInfo = "";
          contentInfo += "终端编号：" + item.deviceNum + "<br/>";
          contentInfo += "工时: " + (item.workDuration == null ? '' : $filter('number')(item.workDuration, 2)) + "<br/>";
          contentInfo += "维度: " + (item.amaplatitudeNum == null ? '' : $filter('number')(item.amaplatitudeNum, 2)) + "<br/>";
          contentInfo += "经度: " + (item.amaplongitudeNum == null ? '' : $filter('number')(item.amaplongitudeNum, 2)) + "<br/>";
          contentInfo += "当前位置：" + (item.address == null ? '' : item.address) + "<br/>";
          contentInfo += "更新时间：" + (item.lastDataUploadTime == null ? '' : $filter('date')(item.lastDataUploadTime, 'yyyy-MM-dd HH:mm:ss')) + "<br/>";
          var info = createInfoWindow(title, contentInfo, mapObj);
          //设置窗体内容
          infoWindow.setContent(info);
        });
        //构建自定义信息窗体
        function createInfoWindow(title, content) {
          var info = document.createElement("div");
          info.className = "info";
          //可以通过下面的方式修改自定义窗体的宽高
          //info.style.width = "400px";
          // 定义顶部标题
          var top = document.createElement("div");
          top.className = "info-top";
          var titleD = document.createElement("div");
          titleD.innerHTML = title;
          var closeX = document.createElement("img");
          closeX.src = "https://webapi.amap.com/images/close2.gif";
          closeX.onclick = closeInfoWindow;
          top.appendChild(titleD);
          top.appendChild(closeX);
          info.appendChild(top);
          // 定义中部内容
          var middle = document.createElement("div");
          middle.className = "info-middle";
          middle.style.backgroundColor = 'white';
          middle.innerHTML = content;
          info.appendChild(middle);
          // 定义底部内容
          var bottom = document.createElement("div");
          bottom.className = "info-bottom";
          bottom.style.position = 'relative';
          bottom.style.top = '0px';
          bottom.style.margin = '0 auto';
          var sharp = document.createElement("img");
          sharp.src = "https://webapi.amap.com/images/sharp.png";
          bottom.appendChild(sharp);
          info.appendChild(bottom);
          return info;
        }
        function closeInfoWindow() {
          mapObj.clearInfoWindow();
        }
      };

             vm.createMarker=function(marker, poi){
                var infoWindow= vm.createInfoWindow(poi);
                infoWindow.open(vm.scopeMap, marker.getPosition());

                AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
                    var infoWindow= vm.createInfoWindow(poi);


                    infoWindow.open(vm.scopeMap, marker.getPosition());

                    var  lnglatXY=[marker.getPosition().getLng(), marker.getPosition().getLat()];
                    vm.updateLocationInfo(poi.address, lnglatXY);

                });
            }

         vm.createInfoWindow=function(poi){
            var infoWindow = new AMap.InfoWindow({
                autoMove: true,
                offset: {x: 0, y: -30}
            });

            infoWindow.setContent(vm.createContent(poi));
            return infoWindow;

        }

        vm.createContent=function(poi) {  //信息窗体内容
            var s = [];
            if(null!=poi.name){


            s.push("<b>名称：" + poi.name+"</b>");
            }
            s.push("围栏地址：" + poi.address+"</b>");
            if (null == vm.radius) {
              vm.radius = 0;
            }
            s.push("半径：" + vm.radius + "米</b>");

            return s.join("<br>");
        }

        /*设置电子围栏*/
        vm.updateScopeMap = function () {
            if (null == deviceinfo.machine || null == deviceinfo.machine.id) {
                Notification.error('当前设备未绑定车辆，无法设置电子围栏');
                return false;
            }
            if(!vm.selectAddress&&typeof(vm.selectAddress)=="undefined"){
                Notification.error(languages.findKey('invalid')+languages.findKey('address'));
                return false;
            }
            if(!vm.amaplongitudeNum&&typeof(vm.amaplongitudeNum)=="undefined"){
                Notification.error(languages.findKey('invalid')+languages.findKey('longitude'));
                return false;
            }
            if(!vm.amaplatitudeNum&&typeof(vm.amaplatitudeNum)=="undefined"){
                Notification.error(languages.findKey('invalid')+languages.findKey('latitude'));
                return false;
            }
            if(!vm.radius||typeof(vm.radius)=="undefined"||isNaN(vm.radius)){
                Notification.error(languages.findKey('invalid')+languages.findKey('rentalRadius'));
                return false;
            }

            var text="距离: "+vm.radius+"(米),   地址: "+vm.selectAddress+",  坐标: 经度 "+vm.amaplongitudeNum+" 维度 "+vm.amaplatitudeNum +" "
            $confirm({text: text,title: '围栏设置确认', ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
                .then(function() {
                    var machieId;
                    if(deviceinfo.machine.id!=null){
                        machieId=deviceinfo.machine.id;
                    }else{
                        machieId=deviceinfo.machine;
                    }
                    var fence={
                        id:machieId,
                        radius:vm.radius,
                        selectAddress:vm.selectAddress,
                        amaplongitudeNum:vm.amaplongitudeNum,
                        amaplatitudeNum:vm.amaplatitudeNum,
                        fenceStatus: '1'
                    }
                    //TODO 保存电子围栏
                    var restResult = serviceResource.restAddRequest(MACHINE_FENCE,fence);
                    restResult.then(function (data) {
                            deviceinfo.machine.fenceStatus = 1;
                            Notification.success("设置电子围栏成功!");
                            //$uibModalInstance.close();
                        },function (reason) {
                            vm.errorMsg=reason.data.message;
                            Notification.error(reason.data.message);
                        }
                    );

                });
        };

      /*取消电子围栏*/
      vm.cacheElectronicFence = function() {
        if (null == deviceinfo.machine || null == deviceinfo.machine.id) {
          Notification.error('当前设备未绑定车辆，无法设置电子围栏');
          return false;
        }
        if (deviceinfo.machine.fenceStatus == null) {
          Notification.error('当前车辆未设置围栏，无需取消');
          return false;
        }
        var text = "确认取消：" + deviceinfo.machine.licenseId + " 车的电子围栏功能吗？";
        $confirm({text: text, title: '取消电子围栏', ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')})
          .then(function () {
            var fence = {
              id: deviceinfo.machine.id,
              radius: 0,
              selectAddress: null,
              amaplongitudeNum: null,
              amaplatitudeNum: null
            };
            //取消电子围栏
            var restResult = serviceResource.restUpdateRequest(MACHINE_FENCE_CACHE, fence);
            restResult.then(function (data) {
                deviceinfo.machine.fenceStatus = 0;
                vm.selectAddress = ''; //选中的地址信息
                vm.amaplongitudeNum = null;//选中的经度
                vm.amaplatitudeNum = null;//选中的维度
                vm.radius = null; //设置的半径
                vm.initScopeMapTab(deviceinfo);
                Notification.success("取消电子围栏成功!");
              }, function (reason) {
                vm.errorMsg = reason.data.message;
                Notification.error(reason.data.message);
              }
            );
          });
      };

        //默认显示当前设备的最新地址
        vm.initScopeMapTab = function(deviceInfo){

          //第一个标注
          var centerAddr;
          // 若已定位,则标注为定位点;若未定位,则标注为围栏中心点
          if(null!=deviceInfo.amaplongitudeNum && null!=deviceInfo.amaplatitudeNum){
            centerAddr = [deviceInfo.amaplongitudeNum,deviceInfo.amaplatitudeNum];
          } else {
            centerAddr = [vm.amaplongitudeNum,vm.amaplatitudeNum];
          }


          //第一个标注
          vm.refreshScopeMapWithDeviceInfo("deviceScopeMap",deviceInfo,15,centerAddr);
        };

        /*监听radius变化*/
        vm.changeradius = function (radius) {
          if(null == vm.newAddress && "" == vm.selectAddress){
            return;
          }
          vm.initScopeMapTab(deviceinfo);
        };
        /*回到以当前车辆为中心点的位置*/
        vm.backCurrentAdd = function () {
          // vm.zoomsize--;
          vm.initScopeMapTab(deviceinfo);
        };


        vm.addMarker=function(map, location) {
            var marker = new AMap.Marker({
                map: map,
                position: location
            });
            var infoWindow = new AMap.InfoWindow({
                content: d.formattedAddress,
                offset: {x: 0, y: -30}
            });
            marker.on("mouseover", function(e) {
                infoWindow.open(map, marker.getPosition());
            });

            AMap.event.addDomListener(marker, 'click', function () {
                infoWindow.open(vm.map, marker.getPosition());
            }, false);

            map.setCenter(location);
        }

        //参数: 地图轨迹gps 数据
        vm.refreshMapTab = function(lineAttr){
          /*****************     第一部分，动画暂停、继续的实现 通过自定义一个控件对象来控制位置变化    ********************/
          /**
           * Marker移动控件
           * @param {Map} map    地图对象
           * @param {Marker} marker Marker对象
           * @param {Array} path   移动的路径，以坐标数组表示
           */
          var MarkerMovingControl = function (map, marker, path) {
            this._map = map;
            this._marker = marker;
            this._path = path;
            this._currentIndex = 0;
            marker.setMap(map);
            marker.setPosition(path[0]);
          };
          /**************************************结束 ***********************************************************/
          var marker;
          var carPostion = lineAttr[0];
          var map = new AMap.Map("deviceDetailMap", {
            resizeEnable: true,
            scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
            zoom: 17
          });
          /*工具条，比例尺，预览插件*/
          AMap.plugin(['AMap.Scale', 'AMap.OverView'],
            function () {
              map.addControl(new AMap.ToolBar());
              map.addControl(new AMap.Scale());
              map.addControl(new AMap.OverView({isOpen: true}));
            });
          AMap.plugin(["AMap.RangingTool"], function () {
          });
          //小车
          marker = new AMap.Marker({
            map: map,
            position: carPostion,
            icon: "assets/images/car_03.png",
            offset: new AMap.Pixel(-26, -13),
            autoRotation: true
          });
          marker.setLabel({
            offset: new AMap.Pixel(-10, -25),//修改label相对于maker的位置
            content: "行使了 0 米"
          });
          // 绘制轨迹
          var polyline = new AMap.Polyline({
            map: map,
            path: lineAttr,
            strokeColor: "#00A",  //线颜色
            strokeOpacity: 1,     //线透明度
            strokeWeight: 3,      //线宽
            strokeStyle: "solid"  //线样式
          });
          map.setFitView();
          var markerMovingControl = new MarkerMovingControl(map, marker, lineAttr);
          var startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
          var lastDistabce = 0;
          /*移动完成触发事件*/
          AMap.event.addListener(marker, "movealong", function () {
            markerMovingControl._currentIndex = 0;
          });
          /*每一步移动完成触发事件*/
          AMap.event.addListener(marker, "moveend", function () {
            markerMovingControl._currentIndex++;
          });
          /*小车每一移动一部就会触发事件*/
          AMap.event.addListener(marker, "moving", function () {
            var distances = parseInt(startLat.distance(marker.getPosition()).toString().split('.')[0]);
            lastDistabce += distances;
            marker.setLabel({
              offset: new AMap.Pixel(-10, -25),
              content: languages.findKey('traveled')+": " + lastDistabce + "&nbsp&nbsp" + languages.findKey('m')
            });
            startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
          });
          /*开始事件*/
          AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
            lastDistabce = 0;
            marker.setLabel({
              offset: new AMap.Pixel(-10, -25),
              content: languages.findKey('traveled')+": " + lastDistabce + "&nbsp&nbsp" + languages.findKey('m')
            });
            startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
            markerMovingControl._currentIndex = 0;
            markerMovingControl._marker.moveAlong(lineAttr, 500);
          }, false);
          /*暂停事件*/
          AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
            markerMovingControl._marker.stopMove();
            var distabcess2 = lastDistabce;
            var distances = parseInt(startLat.distance(markerMovingControl._marker.getPosition()).toString().split('.')[0]);
            distabcess2 += distances;
            marker.setLabel({
              offset: new AMap.Pixel(-10, -25),
              content: languages.findKey('traveled')+": " + distabcess2 + "&nbsp&nbsp" + languages.findKey('m')
            });
          }, false);
          /*继续移动事件*/
          AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
            var lineArr2 = lineAttr.slice(markerMovingControl._currentIndex + 1);
            lineArr2.unshift(marker.getPosition());
            markerMovingControl._marker.moveAlong(lineArr2, 500);
          }, false);
        };

        //设备路径数据
        vm.getDeviceMapData = function(page,size,sort,deviceNum,startDate,endDate){
            if (deviceNum){
                var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
            }
            if (startDate){
                var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
                var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
                if (filterTerm){
                    filterTerm += "&startDate=" + startDateFormated
                }
                else{
                    filterTerm += "startDate=" + startDateFormated;
                }
            }
            if (endDate){
                endDate = new Date(endDate.getTime()-1000*3600*24);
                var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
                var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
                if (filterTerm){
                    filterTerm += "&endDate=" + endDateFormated;
                }
                else{
                    filterTerm += "endDate=" + endDateFormated;
                }
            }
            var lineArr = [];
            var deviceDataPromis = serviceResource.queryDeviceSimpleGPSData(page, size, sort, filterTerm);
            deviceDataPromis.then(function (data) {
                    var deviceMapDataList = data.content;
                    if (deviceMapDataList.length == 0){
                        Notification.warning("所选时间段没有数据");
                    }
                    else{
                        vm.deviceMapDataList = _.sortBy(deviceMapDataList,"locateDateTime");
                        vm.deviceMapDataList.forEach(function (deviceData) {
                            lineArr.push([deviceData.amaplongitudeNum,deviceData.amaplatitudeNum]);
                        })
                        vm.refreshMapTab(lineArr);
                    }
                }, function (reason) {
                    Notification.error(languages.findKey('queryingDataError'));
                }
            )
        };

        var startDate = new Date();
        startDate.setDate(startDate.getDate()-1);
        vm.startDateMapData = startDate;
        vm.endDateMapData = new Date();

        //date picker
        vm.startDateOpenStatusMapData = {
            opened: false
        };
        vm.endDateOpenStatusMapData = {
            opened: false
        };

        vm.startDateOpenMapData = function($event) {
            vm.startDateOpenStatusMapData.opened = true;
        };
        vm.endDateOpenMapData = function($event) {
            vm.endDateOpenStatusMapData.opened = true;
        };

        //历史数据tab
        var startDate = new Date();
        startDate.setDate(startDate.getDate()-1);
        vm.startDate = startDate;
        vm.endDate = new Date();

        vm.startDateDeviceData = startDate;
        vm.endDateDeviceData = new Date();

        //date picker
        vm.startDateOpenStatus = {
            opened: false
        };
        vm.endDateOpenStatus = {
            opened: false
        };
        vm.startDateOpenStatusDeviceData = {
            opened: false
        };
        vm.endDateOpenStatusDeviceData = {
            opened: false
        };

        vm.startDateOpen = function($event) {
            vm.startDateOpenStatus.opened = true;
        };
        vm.endDateOpen = function($event) {
            vm.endDateOpenStatus.opened = true;
        };
        vm.startDateOpenDeviceData = function($event) {
            vm.startDateOpenStatusDeviceData.opened = true;
        };
        vm.endDateOpenDeviceData = function($event) {
            vm.endDateOpenStatusDeviceData.opened = true;
        };

        vm.maxDate = new Date();
        vm.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        // device simple data
        vm.getDeviceSimpleData = function(page,size,sort,deviceNum,startDate,endDate){
            if (vm.operatorInfo){


                var queryCondition;
                if (deviceNum){
                    queryCondition = "&deviceNum=" + deviceNum;
                }

                //要求包含所选择的结束时间
                if (startDate) {
                  queryCondition = queryCondition + "&startDate=" + startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate()+' '+startDate.getHours()+':'+startDate.getMinutes()+':'+startDate.getSeconds();
                }
                if (endDate) {
                  queryCondition = queryCondition + "&endDate=" + endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate()+' '+endDate.getHours()+':'+endDate.getMinutes()+':'+endDate.getSeconds();
                }
                var restCallURL = DEVCEMONITOR_SIMPLE_DATA_PAGED_QUERY;
                var pageUrl = page || 0;
                var sizeUrl = size || 100;
                var sortUrl = sort || "recordTime,desc";
                restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;


                if (queryCondition){
                    restCallURL = restCallURL + queryCondition
                }
                var rspData = serviceResource.restCallService(restCallURL, "GET");
                rspData.then(function(data){
                  if(!data.content.length>0){
                    Notification.warning("所选时间段暂无工作状态数据！");
                    return;
                  }
                    vm.simpleList = data.content;
                    vm.simpleConfig.series[0].data = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取运行数据失败",reason);
                    vm.simpleConfig.series[0].data = null;
                });
            }
        };

        // device data
        vm.getDeviceData = function(page,size,sort,deviceinfo,startDate,endDate){
          //  $location.search({'page':page||0,'size':size||20,'sort':sort||''});
            if (vm.operatorInfo && null != deviceinfo){

                var queryCondition;
                if (deviceinfo.deviceNum){
                    queryCondition = "&deviceNum=" + deviceinfo.deviceNum;
                }
                if (deviceinfo.versionNum) {
                  if (queryCondition) {
                    queryCondition += "&versionNum=" + deviceinfo.versionNum
                  }
                  else {
                    queryCondition += "versionNum=" + deviceinfo.versionNum;
                  }
                }
              if (startDate) {
                var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
                var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
                if (queryCondition) {
                  queryCondition += "&startDate=" + startDateFormated
                }
                else {
                  queryCondition += "startDate=" + startDateFormated;
                }
              } else {
                Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
                return;
              }
              if (endDate) {
                endDate = new Date(endDate.getTime()-1000*3600*24);
                var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
                var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds();
                if (queryCondition) {
                  queryCondition += "&endDate=" + endDateFormated;
                }
                else {
                  queryCondition += "endDate=" + endDateFormated;
                }
              } else {
                Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
                return;
              }

                var restCallURL = DEVCE_DATA_PAGED_QUERY;
                var pageUrl = page || 0;
                var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
                var sortUrl = sort || "dataGenerateTime,desc";
                restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

                if (queryCondition){
                    restCallURL = restCallURL + queryCondition
                }

                var rspData = serviceResource.restCallService(restCallURL, "GET");

                rspData.then(function(data){
                  if(data.content.length>0){
                    vm.deviceDataList = data.content;
                    vm.deviceDataPage = data.page;
                    vm.deviceData_pagenumber = data.page.number + 1;
                    vm.basePath = "device/devicedata";
                  }else {
                    Notification.warning(languages.findKey('noDataYet'));
                  }
                },function(reason){
                    serviceResource.handleRsp(languages.findKey('rentalGetDataError'),reason);
                    vm.deviceInfoList = null;
                });
            }


        };

      //设备位置
      vm.getDeviceLocation = function(page,size,sort,deviceNum,startDate,endDate){
        if (deviceNum){
          var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
        }
        if (startDate){
          var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
          var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
          if (filterTerm){
            filterTerm += "&startDate=" + startDateFormated
          }
          else{
            filterTerm += "startDate=" + startDateFormated;
          }
        } else {
          Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
          return;
        }
        if (endDate){
          endDate = new Date(endDate.getTime()-1000*3600*24);
          var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
          var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds();
          if (filterTerm){
            filterTerm += "&endDate=" + endDateFormated;
          }
          else{
            filterTerm += "endDate=" + endDateFormated;
          }
        } else {
          Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
          return;
        }
        var deviceDataPromis = serviceResource.queryDeviceSimpleGPSData(page, size, sort, filterTerm);
        deviceDataPromis.then(function (data) {
            if(data.content.length>0){
              vm.deviceLocationList = data.content;
              vm.locateDataPage = data.page;
              vm.locateData_pagenumber = data.page.number + 1;
              vm.basePath = "device/devicesimplegpsdata";
            }else {
              vm.deviceLocationList = null;
              Notification.warning(languages.findKey('noDataYet'));
            }
          }, function (reason) {
            Notification.error(languages.findKey('queryingDataError'));
          }
        )
      };

        vm.deviceDataDownload = function (deviceNum, versionNum, startDate, endDate) {
          if (deviceNum) {
            var filterTerm = "deviceNum=" + deviceNum;
          }else {
            Notification.error(languages.findKey('theDeviceNumberEnteredIsIncorrect'));
            return;
          }

          if (versionNum) {
            filterTerm += "&versionNum=" + versionNum;
          }

          if (startDate) {
            filterTerm += "&startDate=" + $filter('date')(startDate, 'yyyy-MM-dd HH:mm:ss');

          }else {
            Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
            return;
          }

          if (endDate) {
            filterTerm += "&endDate=" + $filter('date')(endDate, 'yyyy-MM-dd HH:mm:ss');

          }else {
            Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
            return;
          }
          var restCallURL = DEVCEDATA_EXCELEXPORT;
          if (filterTerm){
            restCallURL += "?";
            restCallURL += filterTerm;
          }

          $http({
            url: restCallURL,
            method: "GET",
            responseType: 'arraybuffer'
          }).success(function (data, status, headers, config) {
            var blob = new Blob([data], { type: "application/vnd.ms-excel" });
            var objectUrl = window.URL.createObjectURL(blob);

            var anchor = angular.element('<a/>');

            //兼容多种浏览器
            if (window.navigator.msSaveBlob) { // IE
              window.navigator.msSaveOrOpenBlob(blob, deviceNum +'.xls')
            } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
              anchor.css({display: 'none'});
              angular.element(document.body).append(anchor);
              anchor.attr({
                href: URL.createObjectURL(blob),
                target: '_blank',
                download:  deviceNum +'.xls'
              })[0].click();
              anchor.remove();
            } else { // Chrome
              anchor.attr({
                href: URL.createObjectURL(blob),
                target: '_blank',
                download:  deviceNum +'.xls'
              })[0].click();
            }


          }).error(function (data, status, headers, config) {
            Notification.error(languages.findKey('failedToDownload'));
          });
        }

        //warning data
        vm.getDeviceWarningData = function(deviceNum,startDate,endDate){
            if (vm.operatorInfo){
                var queryCondition;
                if (deviceNum) {
                  queryCondition = "&deviceNum=" + deviceNum;
                }
                //要求包含所选择的结束时间

                if (startDate) {
                  queryCondition = queryCondition + "&startDate=" + startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate()+' '+startDate.getHours()+':'+startDate.getMinutes()+':'+startDate.getSeconds();
                }
                if (endDate) {
                  queryCondition = queryCondition + "&endDate=" + endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate()+' '+endDate.getHours()+':'+endDate.getMinutes()+':'+endDate.getSeconds();
                }

                var sort = 'warningTime,desc';
                var deviceurl = DEVCEMONITOR_WARNING_DATA_PAGED_QUERY + '?sort=' + sort;
                if (queryCondition) {
                  deviceurl = deviceurl + queryCondition
                }
                var rspData = serviceResource.restCallService(deviceurl, "GET");
                rspData.then(function (data) {
                  if(!data.content.length>0){
                    Notification.warning("所选时间段暂无报警数据！");
                    return;
                  }
                  vm.warningList = [];
                  var wList = data.content;
                  for(var i = 0 ;i<wList.length;i++){
                    var warningTime = new Date(wList[i].warningTime);
                    //new date实际意义,需要用到其时分秒  以及纵坐标的最小值
                    var date = new Date(2016,7,31);
                    date.setHours(warningTime.getHours());
                    date.setMinutes(warningTime.getMinutes());
                    date.setSeconds(warningTime.getSeconds());
                    var data = {
                      x:wList[i].x,
                      y:date.getTime(),
                      warningCode:wList[i].warningCode
                    }
                    vm.warningList.push(data);
                  }
                  vm.warningConfig.series[0].data = vm.warningList;
                }, function (reason) {
                  serviceResource.handleRsp(languages.findKey('failedToGetAlarmData'), reason);
                  vm.warningConfig.series[0].data = null;
                });
            }
        };

        //charger data
        vm.getDeviceChargerData = function(deviceNum,startDate,endDate){
            if (vm.operatorInfo){
              var queryCondition;
              if (deviceNum) {
                queryCondition = "?deviceNum=" + deviceNum;
              }
              //要求包含所选择的结束时间
              var endDateAddOne = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
              if (startDate) {
                queryCondition = queryCondition + "&startDate=" + startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
              }
              if (endDateAddOne) {
                queryCondition = queryCondition + "&endDate=" + endDateAddOne.getFullYear() + '-' + (endDateAddOne.getMonth() + 1) + '-' + endDateAddOne.getDate();
              }
              var restCallURL = DEVCE_CHARGER_DATA;
              if (queryCondition) {
                restCallURL = restCallURL + queryCondition
              }
              var rspData = serviceResource.restCallService(restCallURL, "GET");
              rspData.then(function (data) {
                if(!data.content.length>0){
                  Notification.warning("所选时间段暂无电压变化数据！");
                  return;
                }
                vm.voltageConfig.series[0].data = data.content;
              }, function (reason) {
                serviceResource.handleRsp("获取运行数据失败", reason);
                vm.voltageConfig.series[0].data = null;
              });
            }
        };

        vm.queryTypeData=[{
            type:'01',name:languages.findKey('equipmentState')
        },{
            type:'02',name:languages.findKey('alarmInformation')
        },{
            //2016-07-11 由市电电压调整成蓄电池组电压
            type:'03',name:languages.findKey('batteryVoltage')
        }];

        vm.queryType=vm.queryTypeData[0].type;

        vm.simpleConfig = {
          options: {
            chart: {
              type: 'scatter',
              zoomType: 'xy',
              width: 900,
              height: 480
            },
            legend: {
              layout: 'vertical',
              align: 'left',
              verticalAlign: 'top',
              x: 100,
              y: 70,
              floating: true,
              backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
              borderWidth: 1,
              labelFormat: '{name}' + '<br><b>'+languages.findKey('greenWork')+'</b><br><b>'+languages.findKey('yellowFree') +'</b><br>'
            },
            plotOptions: {
              series: {
                events: {
                  legendItemClick: function () {
                    // return false 即可禁止图例点击响应
                    return false;
                  }
                }
              },
              scatter: {
                marker: {
                  radius: 5,
                  states: {
                    hover: {
                      enabled: true,
                      lineColor: 'rgb(100,100,100)'
                    }
                  }
                },
                states: {
                  hover: {
                    marker: {
                      enabled: false
                    }
                  }
                },
                tooltip: {
                  headerFormat: '<b></b>',
                  shared: true,
                  pointFormatter: function () {
                    var recordDate = new Date(this.x);
                    var datefmt = recordDate.getFullYear() + '-' +  (recordDate.getMonth()+1) + '-' + recordDate.getDate();
                    var datedata = this.y.toString();
                    var padDate = serviceResource.padLeft('000000000', datedata, true);
                    var fmtData = padDate.substr(0, 2) + ':' + padDate.substr(2, 2) + ':' + padDate.substr(4, 2);
                    if (this.color == '#90ed7d') {
                      return '<b>'+languages.findKey('workingState')+'</b><br>' + datefmt + ' ' + fmtData;
                    } else if (this.color == '#f7a35c') {
                      return '<b>'+languages.findKey('idleState')+'</b><br>' + datefmt + ' ' + fmtData;
                    }
                  }
                }
              }
            }
          },
          xAxis: {
            type: 'datetime',
            title: {
              enabled: true,
              text: languages.findKey('date')
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            labels: {
              formatter: function () {
                var date = new Date(this.value);
                return date.getFullYear() + '-' +  (date.getMonth()+1) + '-' + date.getDate();
              }
            },
            tickPositioner: function () {
              var positions = [];
              positions.push(this.dataMin);
              for(var i = 0;i< Math.ceil((this.dataMax - this.dataMin) / 3600/24/1000);i++){
                positions.push(this.dataMin+i*24*3600*1000);
              }
              positions.push(this.dataMax);
              return positions;
            }
          },
          yAxis: {
            title: {
              text: languages.findKey('time')
            },
            labels: {
              formatter: function () {
                var datefmt = this.value;
                var padDate = serviceResource.padLeft('000000000', datefmt, true);
                return padDate.substr(0, 2) + ':' + padDate.substr(2, 2) + ':' + padDate.substr(4, 2);
              }
            }
          },
          series: [{
            name: languages.findKey('workingState'),
            marker: {
              symbol: 'circle'
            },
            turboThreshold: 200000,
            data: []
          }],
          title: {
            text: languages.findKey('hotspotDistribution')
          },
          loading: false,
          // function to trigger reflow in bootstrap containers
          // see: http://jsfiddle.net/pgbc988d/ and https://github.com/pablojim/highcharts-ng/issues/211
          func: function (chart) {
            $timeout(function () {
              chart.reflow();
              //The below is an event that will trigger all instances of charts to reflow
              //vm.$broadcast('highchartsng.reflow');
            }, 0);
          }
        };

        vm.warningConfig = {
          options: {
            chart: {
              type: 'scatter',
              zoomType: 'xy',
              width: 900,
              height: 480
            },
            legend: {
              layout: 'vertical',
              align: 'left',
              verticalAlign: 'top',
              x: 100,
              y: 70,
              floating: true,
              backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
              borderWidth: 1
            },
            plotOptions: {
              scatter: {
                marker: {
                  radius: 5,
                  states: {
                    hover: {
                      enabled: true,
                      lineColor: 'rgb(100,100,100)'
                    }
                  }
                },
                states: {
                  hover: {
                    marker: {
                      enabled: false
                    }
                  }
                },
                tooltip: {
                  headerFormat: '<b>{series.name}</b><br>',
                  shared: true,
                  pointFormatter: function () {
                    var recordDate = new Date(this.x);
                    var datefmt = recordDate.getFullYear() + '-' +  (recordDate.getMonth()+1) + '-' + recordDate.getDate();
                    var recordTime = new Date(this.y);
                    var timefmt = recordTime.getHours() + ':' + recordTime.getMinutes() + ':' + recordTime.getSeconds();
                    var warningMsg = serviceResource.getWarningInfo(this.warningCode);
                    return '<b>日期: </b>' + datefmt + '<br><b>时间: </b>' + timefmt + '<br><b>描述: </b>' + warningMsg.description + '<br><b>处理方法: </b>' + warningMsg.action;
                  }
                }
              },
              line: {
                dataLabels: {
                  enabled: true
                },
                enableMouseTracking: true
              },
              series: {
                cursor: "pointer"
              }
            }
          },
          //时间转为string格式显示处理
          xAxis: {
            title: {
              enabled: true,
              text: languages.findKey('date')
            },
            showLastLabel: true,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
              formatter: function () {
                var date = new Date(this.value);
                return date.getFullYear() + '-' +  (date.getMonth()+1) + '-' + date.getDate();
              }
            },
            tickPositioner: function () {
              var positions = [];
              positions.push(this.dataMin);
              for(var i = 0;i< Math.ceil((this.dataMax - this.dataMin) / 3600/24/1000);i++){
                positions.push(this.dataMin+i*24*3600*1000);
              }
              positions.push(this.dataMax);
              return positions;
            }
          },
          yAxis: {
            title: {
              text: languages.findKey('alarmTime')
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            type: 'datetime',
            dateTimeLabelFormats: {
              second: '%HH:%MM:%SS'
            },
            labels: {
              formatter: function () {
                var date = new Date(this.value);
                return date.getHours() + ':' +  date.getMinutes() + ':' + date.getSeconds();
              }
            }
          },
          series: [{
            name: languages.findKey('alarmInformation'),
            color: 'rgba(205, 51, 51, .5)',
            turboThreshold: 100000,
            data:[]
          }],
          title: {
            text: languages.findKey('alarmInformation')
          },
          loading: false,
          func: function (chart) {
            $timeout(function () {
              chart.reflow();
            }, 0);
          }
        };

        vm.voltageConfig = {
          options: {
            chart: {
              type: 'spline',
              zoomType: 'xy',
              width: 900,
              height: 480
            },
            legend: {
              layout: 'vertical',
              align: 'left',
              verticalAlign: 'top',
              x: 100,
              y: 20,
              floating: true,
              backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
              borderWidth: 1
            },
            plotOptions: {
              scatter: {
                marker: {
                  radius: 5,
                  states: {
                    hover: {
                      enabled: true,
                      lineColor: 'rgb(100,100,100)'
                    }
                  }
                },
                states: {
                  hover: {
                    marker: {
                      enabled: false
                    }
                  }
                }
              }
            },
          },
          xAxis: {
            title: {
              text: languages.findKey('date')
            },
            labels: {
              formatter: function () {
                var datefmt = new Date(this.value);
                return datefmt.getFullYear() + '-' + serviceResource.padLeft('00', datefmt.getMonth() + 1, true) + '-' + datefmt.getDate() + ' ' + datefmt.getHours() + 'H';
              },
              enabled: true
            }
          },
          yAxis: {
            title: {
              text: languages.findKey('volt(V)')
            },
            tickPositions: [0, 5, 10, 15, 20, 25, 30],
            labels: {
              formatter: function () {
                return this.value + 'V';
              }
            }
          },
          series: [{
            name: languages.findKey('batteryVoltage'),
            color: 'rgba(223, 83, 83, .5)',
            turboThreshold: 100000,
            tooltip: {
              headerFormat: '<b>{series.name}</b><br>',
              shared: true,
              pointFormatter: function () {
                var datefmt = new Date(this.x);
                var xDate = datefmt.getFullYear()+ '-' + (datefmt.getMonth()+1) + '-' + datefmt.getDate();
                var xTime = datefmt.getHours()+ ':' + datefmt.getMinutes() + ':' + datefmt.getSeconds() + '.' + datefmt.getMilliseconds();
                return '<b>日期: </b>'+xDate+'<br><b>时间: </b>'+xTime+'<br><b>电压: </b>'+this.y+'V'+'<br>';
              }
            }
          }],
          title: {
            text:  languages.findKey('batteryVoltageVariation')
          },
          loading: false,
          // function to trigger reflow in bootstrap containers
          // see: http://jsfiddle.net/pgbc988d/ and https://github.com/pablojim/highcharts-ng/issues/211
          func: function (chart) {
            $timeout(function () {
              chart.reflow();
              //The below is an event that will trigger all instances of charts to reflow
              //vm.$broadcast('highchartsng.reflow');
            }, 0);
          }
        };

        var curDate = new Date();
        vm.startDate = new Date(curDate-24*3600*1000);

        vm.queryChart = function (queryType, deviceNum, startDate, endDate) {
          if (queryType != '01' && queryType != '02' && queryType != '03') {
            Notification.error("请选择查询类型！");
          } else if (queryType == '01') {
            //设备状态
            vm.getDeviceSimpleData(null, null, null, deviceNum, startDate, endDate);
          } else if (queryType == '02') {
            //报警信息
            vm.getDeviceWarningData(deviceNum, startDate, endDate);
            Highcharts.setOptions({
              // 所有语言文字相关配置都设置在 lang 里
              lang: {
                resetZoom: '重置',
                resetZoomTitle: '重置缩放比例'
              }
            });
          }else if (vm.queryType=='03'){
            //蓄电池组电压
            vm.getDeviceChargerData(deviceNum,startDate,endDate);
          }
        };

        vm.refreshPageDate = function (queryType, deviceNum, startDate, endDate) {
            if (Math.floor((endDate - startDate) / 24 / 3600 / 1000) > 2) {
                $confirm({text: '因数据量较大，若选择时间超过三天，查询可能会较慢，确认继续吗？', title: '消息提示', ok: languages.findKey('confirm'), cancel: languages.findKey('cancel')}).then(
                    function () {
                        vm.queryChart(vm.queryType, vm.deviceinfo.deviceNum, vm.startDate, vm.endDate);
                    }
                )
            } else {
                vm.queryChart(vm.queryType, vm.deviceinfo.deviceNum, vm.startDate, vm.endDate);
            }
        };

        //取消进入页面后自动加载DeviceSimpleDataPage 和 DeviceWarningDataPage
        // $timeout(function() {
        //     vm.refreshPageDate(vm.deviceinfo,vm.startDate,vm.endDate);
        // }, 0);

        //设备数据明细页面
        vm.refreshPageDateDeviceData = function(page,size,sort,deviceinfo,startDate,endDate){
            vm.getDeviceData(page,size,sort,deviceinfo,startDate,endDate);
        };

      //设备位置明细页面
      vm.refreshPageDateDeviceLocation = function(page,size,sort,deviceinfo,startDate,endDate){
        vm.getDeviceLocation(page,size,sort,deviceinfo,startDate,endDate);
      };

        //车辆参数
        vm.parameterConfig = {
            tooltip: {
                triggerOn: 'none',
                formatter: function (params) {
                    return 'X: ' + Math.round(params.data[0]) + '<br>Y: ' + Math.round(params.data[1]);
                }
            },
            xAxis: {
                min: -127,
                max: 127
            },
            yAxis: {
                min: 0,
                max: 100
            },
            series: [{
                id: 'a',
                type: 'line',
                smooth: true,
                symbolSize: 10,
                data: []
            },{
                id: 'b',
                type: 'line',
                smooth: true,
                symbolSize: 10,
                data: []
            }]
        };

        vm.refreshParameterChart = function (queryParameter) {
            var name = queryParameter.name;
            var curve = queryParameter.curve;
            var bIndex1 = curve.bIndex1;

            if(bIndex1 < vm.parameterValue.bJoystickNeutralZone){
                bIndex1 = vm.parameterValue.bJoystickNeutralZone;
            }

            var data1 = [-bIndex1,curve.bPwmNeg1];
            var data2 = [-curve.bIndex2,curve.bPwmNeg2];
            var data3 = [-curve.bIndex3,curve.bPwmNeg3];
            var data4 = [-curve.bIndex4,curve.bPwmNeg4];
            var data5 = [-127,curve.bPwmNegMax];
            var data6 = [bIndex1,curve.bPwmPos1];
            var data7 = [curve.bIndex2,curve.bPwmPos2];
            var data8 = [curve.bIndex3,curve.bPwmPos3];
            var data9 = [curve.bIndex4,curve.bPwmPos4];
            var data10 = [127,curve.bPwmPosMax];

          var parameterData1 = [data1,data2,data3,data4,data5]; //左侧曲线数据
          var parameterData2 = [data6,data7,data8,data9,data10]; //右侧曲线数据
          var parameterData = [data1,data2,data3,data4,data5,data6,data7,data8,data9,data10];

          vm.parameterChart.setOption({
            graphic: echarts.util.map(parameterData, function (item, dataIndex) {
              var data, seriesIndex, id;
              if(dataIndex < 5) {
                data = parameterData1;
                seriesIndex = 0;
                id = 'a';
              } else {
                data = parameterData2;
                seriesIndex = 1;
                dataIndex -= 5;
                id = 'b';
              }
              return {
                type: 'circle',
                position: vm.parameterChart.convertToPixel('grid', item),
                shape: {
                  r: 10
                },
                invisible: true,
                draggable: true,
                ondrag: echarts.util.curry(onPointDragging, data, id, name, dataIndex),
                onmousemove: echarts.util.curry(showTooltip, seriesIndex, dataIndex),
                onmouseout: echarts.util.curry(hideTooltip, dataIndex),
                z: 100
              };
            })
          });
          vm.parameterChart.setOption({
            series: [
              {
                data: parameterData1
              },{
                data: parameterData2
              }]
          });
        };

      function showTooltip(seriesIndex, dataIndex) {
        vm.parameterChart.dispatchAction({
          type: 'showTip',
          seriesIndex: seriesIndex,
          dataIndex: dataIndex
        });
      }

      function hideTooltip(dataIndex) {
        vm.parameterChart.dispatchAction({
          type: 'hideTip'
        });
      }

      function onPointDragging(data, id, name, dataIndex) {
        data[dataIndex] = vm.parameterChart.convertFromPixel('grid', this.position);
        data[dataIndex][1] = data[dataIndex][1]< 0 ? 0 : Math.round(data[dataIndex][1]);
        data[dataIndex][1] = data[dataIndex][1]> 100 ? 100 : Math.round(data[dataIndex][1]);
        if(id == 'b') {
          data[dataIndex][0] = data[dataIndex][0] < 0 ? 0: Math.round(data[dataIndex][0]);
          data[dataIndex][0] = data[dataIndex][0] > 127 ? 127: Math.round(data[dataIndex][0]);
        } else if(id == 'a') {
          data[dataIndex][0] = data[dataIndex][0] < -127 ? -127: Math.round(data[dataIndex][0]);
          data[dataIndex][0] = data[dataIndex][0] > 0 ? 0: Math.round(data[dataIndex][0]);
        }


        if(id == "a") {
          if(name == "上升曲线") {
            vm.selectParameter = vm.parameterValue.liftUpCurve;
          } else {
            if(name == "快速行走曲线") {
              vm.selectParameter = vm.parameterValue.driveFastCurve;
            } else if (name == "起升后行走曲线") {
              vm.selectParameter = vm.parameterValue.driveRisedCurve;
            } else if (name == "慢速行走曲线") {
              vm.selectParameter = vm.parameterValue.driveSlowCurve;
            } else if (name == "转向曲线") {
              vm.selectParameter = vm.parameterValue.steerRisedCurve;
            }

            /*打开下面的注释,调整曲线时左右两侧对称*/
            if(dataIndex == 0) {
              // vm.selectParameter.bPwmPos1 = Math.round(data[dataIndex][1]);
              vm.selectParameter.bPwmNeg1 = Math.round(data[dataIndex][1]);
            } else if (dataIndex == 1) {
              vm.selectParameter.bIndex2 = Math.round(-data[dataIndex][0]);
              // vm.selectParameter.bPwmPos2 = Math.round(data[dataIndex][1]);
              vm.selectParameter.bPwmNeg2 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 2) {
              vm.selectParameter.bIndex3 = Math.round(-data[dataIndex][0]);
              // vm.selectParameter.bPwmPos3 = Math.round(data[dataIndex][1]);
              vm.selectParameter.bPwmNeg3 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 3) {
              vm.selectParameter.bIndex4 = Math.round(-data[dataIndex][0]);
              // vm.selectParameter.bPwmPos4 = Math.round(data[dataIndex][1]);
              vm.selectParameter.bPwmNeg4 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 4) {
              // vm.selectParameter.bPwmPosMax = Math.round(data[dataIndex][1]);
              vm.selectParameter.bPwmNegMax = Math.round(data[dataIndex][1]);
            }
          }
        } else if(id == "b") {
          if(name == "上升曲线") {
            vm.selectParameter = vm.parameterValue.liftUpCurve;
            if(dataIndex == 0) {
              vm.selectParameter.bPwmPos1 = Math.round(data[dataIndex][1]);
            } else if (dataIndex == 1) {
              vm.selectParameter.bIndex2 = Math.round(data[dataIndex][0]);
              vm.selectParameter.bPwmPos2 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 2) {
              vm.selectParameter.bIndex3 = Math.round(data[dataIndex][0]);
              vm.selectParameter.bPwmPos3 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 3) {
              vm.selectParameter.bIndex4 = Math.round(data[dataIndex][0]);
              vm.selectParameter.bPwmPos4 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 4) {
              vm.selectParameter.bPwmPosMax = Math.round(data[dataIndex][1]);
            }
          } else {
            if(name == "快速行走曲线") {
              vm.selectParameter = vm.parameterValue.driveFastCurve;
            } else if (name == "起升后行走曲线") {
              vm.selectParameter = vm.parameterValue.driveRisedCurve;
            } else if (name == "慢速行走曲线") {
              vm.selectParameter = vm.parameterValue.driveSlowCurve;
            } else if (name == "转向曲线") {
              vm.selectParameter = vm.parameterValue.steerRisedCurve;
            }

            /*打开下面的注释,调整曲线时左右两侧对称*/
            if(dataIndex == 0) {
              vm.selectParameter.bPwmPos1 = Math.round(data[dataIndex][1]);
              // vm.selectParameter.bPwmNeg1 = Math.round(data[dataIndex][1]);
            } else if (dataIndex == 1) {
              vm.selectParameter.bIndex2 = Math.round(data[dataIndex][0]);
              vm.selectParameter.bPwmPos2 = Math.round(data[dataIndex][1]);
              // vm.selectParameter.bPwmNeg2 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 2) {
              vm.selectParameter.bIndex3 = Math.round(data[dataIndex][0]);
              vm.selectParameter.bPwmPos3 = Math.round(data[dataIndex][1]);
              // vm.selectParameter.bPwmNeg3 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 3) {
              vm.selectParameter.bIndex4 = Math.round(data[dataIndex][0]);
              vm.selectParameter.bPwmPos4 = Math.round(data[dataIndex][1]);
              // vm.selectParameter.bPwmNeg4 = Math.round(data[dataIndex][1]);
            } else if(dataIndex == 4) {
              vm.selectParameter.bPwmPosMax = Math.round(data[dataIndex][1]);
              // vm.selectParameter.bPwmNegMax = Math.round(data[dataIndex][1]);
            }
          }
        }

        if(name == "快速行走曲线") {
          vm.parameterValue.driveFastCurve = vm.selectParameter;
          vm.refreshParameterChart(vm.parameterTypeList[0]);
        } else if (name == "起升后行走曲线") {
          vm.parameterValue.driveRisedCurve = vm.selectParameter;
          vm.refreshParameterChart(vm.parameterTypeList[1]);
        } else if (name == "上升曲线") {
          vm.parameterValue.liftUpCurve = vm.selectParameter;
          vm.refreshParameterChart(vm.parameterTypeList[2]);
        } else if (name == "慢速行走曲线") {
          vm.parameterValue.driveSlowCurve = vm.selectParameter;
          vm.refreshParameterChart(vm.parameterTypeList[3]);
        } else if (name == "转向曲线") {
          vm.parameterValue.steerRisedCurve = vm.selectParameter;
          vm.refreshParameterChart(vm.parameterTypeList[4]);
        }
      }


        vm.initParameterTab = function (deviceinfo) {
            vm.parameterChart = echarts.init(document.getElementById('parameterChart'));
            vm.parameterChart.setOption(vm.parameterConfig);
            vm.machineParametersReadonly = true; //默认车辆参数不可编辑
            var restURL = DEVCEINFO_PARAMETER_URL + "?deviceNum=" + deviceinfo.deviceNum;
            var rspData = serviceResource.restCallService(restURL, "GET");
            rspData.then(function (data) {
              if(data.code == -1 && deviceinfo.versionNum == "11") {
                Notification.warning(languages.findKey("NoVehicleParameter"));
                // 写ECU参数类型
                // var writeURL = SEND_MQTT_WRITE_URL + "?type=26&deviceNum=" + deviceinfo.deviceNum + "&content=0";
                // var restPromise = serviceResource.restCallService(writeURL, "ADD", null);
              } else if(data.code == 0) {
                vm.parameterValue = data.content;
                vm.parameterValue.bBrakeDelay = data.content.bBrakeDelay*100;
                vm.parameterValue.bCoilFaultDetectionPeriod = data.content.bCoilFaultDetectionPeriod*10;
                vm.parameterValue.bSteeringOffDelay = data.content.bSteeringOffDelay*100;
                vm.parameterValue.bDirectionDelay = data.content.bDirectionDelay*10;
                vm.parameterValue.bMotorEnableDelay = data.content.bMotorEnableDelay*10;
                vm.parameterValue.bOverloadStabilizationPeriod = data.content.bOverloadStabilizationPeriod*100;
                vm.parameterValue.bBatteryLevel1 = (data.content.bBatteryLevel1+100)/10;
                vm.parameterValue.bBatteryLevel2 = (data.content.bBatteryLevel2+100)/10;
                vm.parameterValue.bBatteryLevel3 = (data.content.bBatteryLevel3+100)/10;
                vm.parameterValue.bBatteryLevel4 = (data.content.bBatteryLevel4+100)/10;
                vm.parameterValue.bBatteryLevel5 = (data.content.bBatteryLevel5+100)/10;
                vm.parameterValue.bTiltBrakeDelay = data.content.bTiltBrakeDelay*10;
                vm.parameterValue.bLevelBrakeDelay = data.content.bLevelBrakeDelay*10;

                vm.parameterTypeList=[{
                    name:languages.findKey('fastWalkingCurve'),curve : vm.parameterValue.driveFastCurve
                },{
                    name:languages.findKey('walkingCurveAfterLifting'),curve : vm.parameterValue.driveRisedCurve
                },{
                    name:languages.findKey('risingCurve'),curve : vm.parameterValue.liftUpCurve
                },{
                    name:languages.findKey('slowWalkingCurve'),curve : vm.parameterValue.driveSlowCurve
                },{
                    name:languages.findKey('steeringCurve'),curve : vm.parameterValue.steerRisedCurve
                }];

                vm.queryParameter = vm.parameterTypeList[0];
                vm.refreshParameterChart(vm.queryParameter);
              }
            }, function (reason) {
                Notification.error('获取车辆参数失败');
                Notification.error(reason.data.message);
            });
        };

        /**
         * 车辆参数编辑
         */
        vm.machineParametersEdit = function () {
          vm.machineParametersReadonly = false;
          if(!vm.parameterValue || null == vm.parameterValue || vm.parameterValue == "") {
            vm.machineParametersReadonly = true;
          }
        };

        /**
         * MQTT下发车辆参数
         * @param deviceNum
         * @param parameterValue
         */
        vm.sendMQTTParameters = function (deviceNum, parameterValue) {
          if(null == deviceNum || deviceNum == '') {
            Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
            return;
          }
          var content = "[" + parameterValue.bLiftType +","+ parameterValue.bMajor +","+ parameterValue.bMinor +","+ Math.round(parameterValue.bBrakeDelay/100) +","+ Math.round(parameterValue.bCoilFaultDetectionPeriod/10) +","+ Math.round(parameterValue.bSteeringOffDelay/100) +","+
            Math.round(parameterValue.bDirectionDelay/10) +","+ Math.round(parameterValue.bMotorEnableDelay/10) +","+ Math.round(parameterValue.bOverloadStabilizationPeriod/100) +","+ parameterValue.bSteeringBoostPwm +","+ parameterValue.bNeutralSteeringPwm +","+
            parameterValue.bChassisLiftUpPwm +","+ parameterValue.bPlatformLiftUpMaxPwm +","+ parameterValue.bJoystickOffsetCompensation +","+ parameterValue.bJoystickNeutralZone +","+ Math.round(parameterValue.bBatteryLevel1*10-100) +","+ Math.round(parameterValue.bBatteryLevel2*10-100) +","+
            Math.round(parameterValue.bBatteryLevel3*10-100) +","+ Math.round(parameterValue.bBatteryLevel4*10-100) +","+ Math.round(parameterValue.bBatteryLevel5*10-100) +","+ Math.round(parameterValue.bTiltBrakeDelay/10) +","+ Math.round(parameterValue.bLevelBrakeDelay/10) +","+
            parameterValue.driveFastCurve.bIndex1 +","+ parameterValue.driveFastCurve.bIndex2 +","+ parameterValue.driveFastCurve.bIndex3 +","+ parameterValue.driveFastCurve.bIndex4 +","+ parameterValue.driveFastCurve.bPwmPos1 +","+ parameterValue.driveFastCurve.bPwmPos2 +","+
            parameterValue.driveFastCurve.bPwmPos3 +","+ parameterValue.driveFastCurve.bPwmPos4 +","+ parameterValue.driveFastCurve.bPwmPosMax +","+ parameterValue.driveFastCurve.bPwmPosMax +","+ parameterValue.driveFastCurve.bPwmNeg1 +","+ parameterValue.driveFastCurve.bPwmNeg2 +","+
            parameterValue.driveFastCurve.bPwmNeg3 +","+ parameterValue.driveFastCurve.bPwmNeg4 +","+ parameterValue.driveFastCurve.bPwmNegMax +","+ parameterValue.driveFastCurve.bPwmNegMax +","+ parameterValue.driveFastCurve.bAccelIncrement +","+
            parameterValue.driveFastCurve.bDecelIncrement +","+ parameterValue.driveFastCurve.bPeriod +","+
            parameterValue.driveRisedCurve.bIndex1 +","+ parameterValue.driveRisedCurve.bIndex2 +","+ parameterValue.driveRisedCurve.bIndex3 +","+ parameterValue.driveRisedCurve.bIndex4 +","+ parameterValue.driveRisedCurve.bPwmPos1 +","+ parameterValue.driveRisedCurve.bPwmPos2 +","+
            parameterValue.driveRisedCurve.bPwmPos3 +","+ parameterValue.driveRisedCurve.bPwmPos4 +","+ parameterValue.driveRisedCurve.bPwmPosMax +","+ parameterValue.driveRisedCurve.bPwmPosMax +","+ parameterValue.driveRisedCurve.bPwmNeg1 +","+ parameterValue.driveRisedCurve.bPwmNeg2 +","+
            parameterValue.driveRisedCurve.bPwmNeg3 +","+ parameterValue.driveRisedCurve.bPwmNeg4 +","+ parameterValue.driveRisedCurve.bPwmNegMax +","+ parameterValue.driveRisedCurve.bPwmNegMax +","+ parameterValue.driveRisedCurve.bAccelIncrement +","+
            parameterValue.driveRisedCurve.bDecelIncrement +","+ parameterValue.driveRisedCurve.bPeriod +","+
            parameterValue.liftUpCurve.bIndex1 +","+ parameterValue.liftUpCurve.bIndex2 +","+ parameterValue.liftUpCurve.bIndex3 +","+ parameterValue.liftUpCurve.bIndex4 +","+ parameterValue.liftUpCurve.bPwmPos1 +","+ parameterValue.liftUpCurve.bPwmPos2 +","+
            parameterValue.liftUpCurve.bPwmPos3 +","+ parameterValue.liftUpCurve.bPwmPos4 +","+ parameterValue.liftUpCurve.bPwmPosMax +","+ parameterValue.liftUpCurve.bPwmPosMax +","+ parameterValue.liftUpCurve.bPwmNeg1 +","+ parameterValue.liftUpCurve.bPwmNeg2 +","+
            parameterValue.liftUpCurve.bPwmNeg3 +","+ parameterValue.liftUpCurve.bPwmNeg4 +","+ parameterValue.liftUpCurve.bPwmNegMax +","+ parameterValue.liftUpCurve.bPwmNegMax +","+ parameterValue.liftUpCurve.bAccelIncrement +","+
            parameterValue.liftUpCurve.bDecelIncrement +","+ parameterValue.liftUpCurve.bPeriod +","+
            parameterValue.driveSlowCurve.bIndex1 +","+ parameterValue.driveSlowCurve.bIndex2 +","+ parameterValue.driveSlowCurve.bIndex3 +","+ parameterValue.driveSlowCurve.bIndex4 +","+ parameterValue.driveSlowCurve.bPwmPos1 +","+ parameterValue.driveSlowCurve.bPwmPos2 +","+
            parameterValue.driveSlowCurve.bPwmPos3 +","+ parameterValue.driveSlowCurve.bPwmPos4 +","+ parameterValue.driveSlowCurve.bPwmPosMax +","+ parameterValue.driveSlowCurve.bPwmPosMax +","+ parameterValue.driveSlowCurve.bPwmNeg1 +","+ parameterValue.driveSlowCurve.bPwmNeg2 +","+
            parameterValue.driveSlowCurve.bPwmNeg3 +","+ parameterValue.driveSlowCurve.bPwmNeg4 +","+ parameterValue.driveSlowCurve.bPwmNegMax +","+ parameterValue.driveSlowCurve.bPwmNegMax +","+ parameterValue.driveSlowCurve.bAccelIncrement +","+
            parameterValue.driveSlowCurve.bDecelIncrement +","+ parameterValue.driveSlowCurve.bPeriod +","+
            parameterValue.steerRisedCurve.bIndex1 +","+ parameterValue.steerRisedCurve.bIndex2 +","+ parameterValue.steerRisedCurve.bIndex3 +","+ parameterValue.steerRisedCurve.bIndex4 +","+ parameterValue.steerRisedCurve.bPwmPos1 +","+ parameterValue.steerRisedCurve.bPwmPos2 +","+
            parameterValue.steerRisedCurve.bPwmPos3 +","+ parameterValue.steerRisedCurve.bPwmPos4 +","+ parameterValue.steerRisedCurve.bPwmPosMax +","+ parameterValue.steerRisedCurve.bPwmPosMax +","+ parameterValue.steerRisedCurve.bPwmNeg1 +","+ parameterValue.steerRisedCurve.bPwmNeg2 +","+
            parameterValue.steerRisedCurve.bPwmNeg3 +","+ parameterValue.steerRisedCurve.bPwmNeg4 +","+ parameterValue.steerRisedCurve.bPwmNegMax +","+ parameterValue.steerRisedCurve.bPwmNegMax +","+ parameterValue.steerRisedCurve.bAccelIncrement +","+
            parameterValue.steerRisedCurve.bDecelIncrement +","+ parameterValue.steerRisedCurve.bPeriod + "]";

          vm.sendMQTTWrite(27, deviceNum, content);
        };

      //标定参数
      vm.calibrationParameterConfig = {
        tooltip: {
          triggerOn: 'none',
          formatter: function (params) {
            return 'X: ' + Math.round(params.data[0]) + '<br>Y: ' + Math.round(params.data[1]);
          }
        },
        xAxis: {
          min: 0,
          max: 4096,
          name: '高度'
        },
        yAxis: {
          min: 0,
          max: 4096,
          name: languages.findKey('voltage')
        },
        series: [{
          type: 'line',
          smooth: true,
          symbolSize: 10,
          data: []
        }]
      };

      /**
       * 标定参数图表增加拖拽监听
       * @param calibrationParameterData 数据
         */
      vm.refreshCalibrationParameterChart = function (calibrationParameterData) {
        vm.calibrationParameterChart.setOption({
          graphic: echarts.util.map(calibrationParameterData, function (item, dataIndex) {
            return {
              type: 'circle',
              position: vm.calibrationParameterChart.convertToPixel('grid', item),
              shape: {
                r: 10
              },
              invisible: true,
              draggable: true,
              ondrag: echarts.util.curry(onPointDragging2, calibrationParameterData, dataIndex),
              onmousemove: echarts.util.curry(showTooltip2, dataIndex),
              onmouseout: echarts.util.curry(hideTooltip2, dataIndex),
              z: 100
            };
          })
        });

        vm.calibrationParameterChart.setOption({
          series: [
            {
              data: calibrationParameterData
            }]
        });
      };

      function showTooltip2(dataIndex) {
        vm.calibrationParameterChart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: dataIndex
        });
      }

      function hideTooltip2(dataIndex) {
        vm.calibrationParameterChart.dispatchAction({
          type: 'hideTip'
        });
      }

      /**
       * 标定参数图表拖拽方法
       * @param data 数据
       * @param dataIndex 拖拽点的下标
         */
      function onPointDragging2(data, dataIndex) {
        var dataLen = data.length;
        var y = data[dataIndex][1];
        var update = vm.calibrationParameterChart.convertFromPixel('grid', this.position);
        var updateY = Math.round(update[1]) - y;
        var maxY = data[0][1];
        var minY = data[0][1];
        for(var m = 0; m < dataLen; m++) {
          maxY = data[m][1] > maxY ? data[m][1] : maxY;
          minY = data[m][1] < minY ? data[m][1] : minY;
        }
        updateY = (maxY + updateY) > 4096 ? 0 : updateY;
        updateY = (minY + updateY) < 0 ? 0 : updateY;

        for(var i = 0;i<data.length;i++) {
          data[i][1] = data[i][1] + updateY;
        }

        var dataValue = "[";
        var dataValueY = "";
        for(var j = 0;j < dataLen;j++) {
          dataValue += data[j][0] + ",";
          dataValueY += data[j][1] + ",";
        }
        dataValue += dataValueY;
        dataValue = dataValue.substring(0, dataValue.length - 1);
        dataValue += "]";
        vm.calibrationParameterValue = dataValue;
        vm.refreshCalibrationParameterChart(data);
      }


      vm.calibrationParameterType = 1; //默认标定参数类型
      vm.overloadValue = vm.deviceinfo.overloadPercentage==null?"":vm.deviceinfo.overloadPercentage;
      if(null != vm.deviceinfo.brakeMode && vm.deviceinfo.brakeMode != "") {
        if(vm.deviceinfo.brakeMode == 0) {
          vm.brakeModeSelected = true;
        } else if(vm.deviceinfo.brakeMode == 1) {
          vm.brakeModeSelected = false;
        } else {
          vm.brakeMode = "0";
          vm.brakeModeSelected = true;
        }
      } else {
        vm.brakeMode = "0";
        vm.brakeModeSelected = true;
      }

      /**
       * 初始化标定参数图表
       * @param deviceinfo
       * @param calibrationParameterType 标定参数类型
         */
      vm.initCalibrationParameter = function (deviceinfo, calibrationParameterType) {
        vm.calibrationParameterChart = echarts.init(document.getElementById('calibrationParameterChart'));
        vm.calibrationParameterChart.setOption(vm.calibrationParameterConfig);

        if(calibrationParameterType == 1 && null != vm.staticNoLoadImportValue && vm.staticNoLoadImportValue != "") { //静态空载并且有导入值
          vm.calibrationParameterValue = vm.staticNoLoadImportValue;
          vm.processCalibrationParameterData();
        } else if(calibrationParameterType == 2 && null != vm.staticFullLoadImportValue && vm.staticFullLoadImportValue != "") { //静态满载并且有导入值
          vm.calibrationParameterValue = vm.staticFullLoadImportValue;
          vm.processCalibrationParameterData();
        } else if(calibrationParameterType == 3 && null != vm.dynamicNoLoadImportValue && vm.dynamicNoLoadImportValue != "") { //动态空载并且有导入值
          vm.calibrationParameterValue = vm.dynamicNoLoadImportValue;
          vm.processCalibrationParameterData();
        } else if(calibrationParameterType == 4 && null != vm.dynamicFullLoadImportValue && vm.dynamicFullLoadImportValue != "") { //动态满载并且有导入值
          vm.calibrationParameterValue = vm.dynamicFullLoadImportValue;
          vm.processCalibrationParameterData();
        } else {
          var restURL = DEVCEINFO_CALIBRATION_PARAMETER_URL + "?deviceNum=" + deviceinfo.deviceNum + "&calibrationParameterType=" + calibrationParameterType;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {
            if(data.code == -1 && deviceinfo.versionNum == "11") {
              Notification.warning(languages.findKey("NoCalibrationParameter"));
              // 写ECU参数类型
              // var writeURL = SEND_MQTT_WRITE_URL + "?type=26&deviceNum=" + deviceinfo.deviceNum + "&content=" + calibrationParameterType;
              // var restPromise = serviceResource.restCallService(writeURL, "ADD", null);
            } else if(data.code == 0) {
              vm.calibrationParameterValue = data.content;
              vm.processCalibrationParameterData();
            }
          }, function (reason) {
            Notification.error('获取车辆参数失败');
            Notification.error(reason.data.message);
          });
        }
      };

      /**
       * 处理标定参数数据
       */
      vm.processCalibrationParameterData = function() {
        var parameterArrays = vm.calibrationParameterValue.replace("[", "").replace("]", "").split(", ");
        var values = "[";
        var valuesY = "";
        var num = parameterArrays.length/2;
        vm.calibrationParameterData = [];
        for (var i = 0; i < num; i++) {
          vm.calibrationParameterData.push([Math.round(parameterArrays[i]), Math.round(parameterArrays[i + num])]);
          values += Math.round(parameterArrays[i]) + ",";
          valuesY += Math.round(parameterArrays[i + num]) + ",";
        }
        values += valuesY;
        values = values.substring(0, values.length - 1);
        values += "]";
        vm.calibrationParameterValue = values;
        vm.refreshCalibrationParameterChart(vm.calibrationParameterData);
      };

      /**
       * MQTT下发标定参数
       * @param deviceNum 设备号
       * @param calibrationParameterValue 标定参数值
       * @param calibrationParameterType 标定参数类型
         */
      vm.sendMQTTCalibrationParameters = function (deviceNum, calibrationParameterValue, calibrationParameterType) {
        if(null == deviceNum || deviceNum == '') {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var type;
        if(calibrationParameterType == 1) {
          type = 28;
        } else if(calibrationParameterType == 2) {
          type = 29;
        } else if(calibrationParameterType == 3) {
          type = 30;
        } else if(calibrationParameterType == 4) {
          type = 31;
        }

        if(null == type) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        vm.sendMQTTWrite(type, deviceNum, calibrationParameterValue);
      };

      /**
       * MQTT下发标定参数相关值
       * @param deviceNum 设备号
       * @param parameter1 参数1
       * @param parameter2 参数2
       * @param type
       */
      vm.sendMQTTCalibrationParameterValues = function (deviceNum, parameter1, parameter2, type) {
        if(null==parameter1||parameter1==""||null==parameter2||parameter2==""||null==type) {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var content = parameter1+','+parameter2;
        vm.sendMQTTWrite(type, deviceNum, content);
      };

      /**
       * 标定参数导出
       * @param deviceNum 设备号
         */
      vm.calibrationParametersDownload = function (deviceNum) {
        if(null == deviceNum || deviceNum == '') {
          Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
          return;
        }
        var restCallURL = CALIBRATION_PARAMETER_EXPORT + "?deviceNum=" + deviceNum;
        $http({
          url: restCallURL,
          method: "GET",
          responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {
          var blob = new Blob([data], { type: "application/vnd.ms-excel" });
          var objectUrl = window.URL.createObjectURL(blob);

          var anchor = angular.element('<a/>');
          anchor.attr({
            href: objectUrl,
            target: '_blank',
            download: deviceNum +'标定参数.xls'
          })[0].click();

        }).error(function (data, status, headers, config) {
          Notification.error(languages.findKey('failedToDownload'));
        });
      };

      /**
       * 标定参数导入
       * @param size
         */
      vm.calibrationParametersImport = function (size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/deviceMonitor/calibrationParametersImport.html',
          controller: 'calibrationParametersImportController as calibrationParametersImportController',
          size: size,
          backdrop: false,
          resolve: {
            operatorInfo: function () {
              return vm.operatorInfo;
            }
          }
        });

        modalInstance.result.then(function (result) {
          vm.staticNoLoadImportValue = result[0];
          vm.staticFullLoadImportValue = result[1];
          vm.dynamicNoLoadImportValue = result[2];
          vm.dynamicFullLoadImportValue = result[3];
          vm.initCalibrationParameter(vm.deviceinfo, vm.calibrationParameterType);
        }, function () {
          //取消
        });
      };


      //battery data
      vm.startYearValue = 2017;
      vm.startMonthValue = 1;
      vm.startDayValue = 1;
      var batteryInChartData = [];
      var batteryOutChartData = [];
      var batteryFormData;

      var startDate = new Date();
      startDate.setDate(startDate.getDate()-1);
      vm.startDate = startDate;
      vm.endDate = new Date();

      vm.startDateBatteryData = startDate;
      vm.endDateBatteryData = new Date();

      //date picker
      vm.startDateOpenStatus = {
        opened: false
      };
      vm.endDateOpenStatus = {
        opened: false
      };
      vm.startDateOpenStatusBatteryData = {
        opened: false
      };
      vm.endDateOpenStatusBatteryData = {
        opened: false
      };

      vm.startDateOpen = function($event) {
        vm.startDateOpenStatus.opened = true;
      };
      vm.endDateOpen = function($event) {
        vm.endDateOpenStatus.opened = true;
      };
      vm.startDateOpenBatteryData = function($event) {
        vm.startDateOpenStatusBatteryData.opened = true;
      };
      vm.endDateOpenBatteryData = function($event) {
        vm.endDateOpenStatusBatteryData.opened = true;
      };

      vm.maxDate = new Date();
      vm.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };


      vm.refreshPageDateBatteryData = function(deviceNum,startDate,endDate){
        getBatteryData(deviceNum,startDate,endDate,0);
        getBatteryData(deviceNum,startDate,endDate,1);
        getBatteryFormData(deviceNum);
      };


      //串联显示3个液位,并联显示6个液位
      vm.showLiquidLevel = function(batteryLinkType){
         if(batteryLinkType == 0){
           return false;
         }else{
           return true;
         }
        return false;
      };



      var getBatteryData = function(deviceNum,startDate,endDate,chargeType){
        if (vm.operatorInfo){
          var queryCondition;
          if (deviceNum){
            queryCondition = "?deviceNum=" + deviceNum;
          }

          if (startDate) {
            var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
            var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
            if (queryCondition) {
              queryCondition += "&startDate=" + startDateFormated
            }
            else {
              queryCondition += "startDate=" + startDateFormated;
            }
          } else {
            Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
            return;
          }
          if (endDate) {
            var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
            var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds();
            if (queryCondition) {
              queryCondition += "&endDate=" + endDateFormated;
            }
            else {
              queryCondition += "endDate=" + endDateFormated;
            }
          } else {
            Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
            return;
          }

          var restCallURL = BATTERY_CHART_DATA;

          if (queryCondition){
            restCallURL = restCallURL + queryCondition + '&' + 'chargeType' + '=' + chargeType;
          }

          var rspData = serviceResource.restCallService(restCallURL, "GET");
          rspData.then(function(data){
            if(chargeType == 0){

              batteryOutChartData = data.data;
              refreshBatteryOutChart(batteryOutChartData,data.time);
            }else{

              batteryInChartData = data.data;
              refreshBatteryInChart(batteryInChartData,data.time);
            }
          },function(reason){
            Notification.warning("没有数据");
            vm.deviceInfoList = null;
          });

        }
      };



      var getBatteryFormData = function(deviceNum){
        var restCallURL = BATTERY_FORM_DATA;
        restCallURL += '?' + 'deviceNum' + '=' + deviceNum;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function(data){
          batteryFormData = data;
          vm.batteryLiquidLevelList = batteryFormData.deviceCurrentCharger;
          $scope.batteryFormData = batteryFormData;
        },function(reason){
          Notification.warning("没有数据");
          vm.deviceInfoList = null;
        });
      };

      vm.batteryIn = {
        options: {
          title: {
            text: languages.findKey('chargingMonitoring')
          }
        }
      };
      vm.batteryOut = {
        options: {
          title: {
            text: languages.findKey('dischargeMonitoring')
          }
        }
      };

      var refreshBatteryInChart = function(batteryInChartData,time){
        batteryInChartData[0].color='#486dff';
        batteryInChartData[1].color='#46ff2c';
        batteryInChartData[2].color='#5ec1ff';
        batteryInChartData[3].color='#32d6ff';
        vm.batteryIn = {
          options: {
            chart:{
              type: 'spline',
              zoomType: 'x'
            },
            title: {
              text: languages.findKey('chargingMonitoring')
            },
            xAxis: {
              type: 'datetime',
              categories:time,
              title: {
                enabled: true,
                text: languages.findKey('date')
              },
              showLastLabel: true,
              tickInterval:100,
              shared:true,
              labels: {
                formatter: function () {
                  return $filter('date')(new Date(this.value), 'yyyy-MM-dd HH:mm:ss');
                }
              }
            },
            yAxis: {
              title: {
                text: languages.findKey('voltage'),
                rotation:0,
                align: 'high',
                y:-20,
                offset: -10,
                min: 0
              }
            },
            tooltip: {
              shared: true,
              formatter:function(){
                var s = '<b>' + $filter('date')(new Date(this.x), 'yyyy-MM-dd HH:mm:ss') + '</b>';
                angular.forEach(this.points, function(data,index,array){
                  s += '<br/>' + data.series.name + ': ' + data.y + 'V';
                });
                return s;
              }
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle'
            }
          },
          series: batteryInChartData
        };

      };

      var refreshBatteryOutChart = function(batteryOutChartData,time){
        batteryOutChartData[0].color='#486dff';
        batteryOutChartData[1].color='#46ff2c';
        batteryOutChartData[2].color='#5ec1ff';
        batteryOutChartData[3].color='#32d6ff';
        vm.batteryOut = {
          options: {
            chart:{
              type: 'spline',
              zoomType: 'x'
            },
            title: {
              text: languages.findKey('dischargeMonitoring')
            },
            xAxis: {
              type: 'datetime',
              categories:time,
              title: {
                enabled: true,
                text: languages.findKey('date')
              },
              tickInterval:100,
              showLastLabel: true,
              labels: {
                formatter: function () {
                  return $filter('date')(new Date(this.value), 'yyyy-MM-dd HH:mm:ss');
                }
              }
            },
            yAxis: {
              title: {
                text: languages.findKey('voltage'),
                rotation:0,
                align: 'high',
                y:-20,
                offset: -10,
                min: 0
              }
            },
            tooltip: {
              shared: true,
              formatter:function(){
                var s = '<b>' + $filter('date')(new Date(this.x), 'yyyy-MM-dd HH:mm:ss') + '</b>';
                angular.forEach(this.points, function(data,index,array){
                  s += '<br/>' + data.series.name + ': ' + data.y + 'V';
                });
                return s;
              }
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle'
            }
          },
          series: batteryOutChartData
        };
      }

      /**
       * 操作日志
       * @param versionNum
       * @param phoneNumber
         */
      vm.getLockData = function (versionNum, phoneNumber) {
        if(versionNum == 'A001') {
          vm.getOperationLog(1, phoneNumber);
        }
      };

      /**
       * 根据操作方式获取操作日志
       * @param type    1:短信   2:MQTT
       * @param phoneNumber
       * @param deviceNum
         */
      vm.getOperationLog = function (type, phoneNumber, deviceNum) {
        if(type == null || type == "") {
          Notification.warning(languages.findKey("pleaseChooseTheModeOfOperation"));
          return;
        }
        ngTableDefaults.settings.counts = [];
        vm.lockDataTable = new NgTableParams({
          count: 8,
          sorting: {sendTime: 'desc'}
        }, {
          dataset: null
        });
        if(type == 1) { //短信
          var restCallURL = DEVCE_LOCK_DATA_PAGED_QUERY;

          if (phoneNumber&&!angular.isUndefined(phoneNumber)) {
            restCallURL += "?phoneNumber=" + $filter('uppercase')(phoneNumber);
          }else {
            Notification.warning(languages.findKey('theDeviceDoesNotBindTheSimCard'));
            return;
          }
          var deviceLockDataPromis = serviceResource.restCallService(restCallURL, "QUERY");
          deviceLockDataPromis.then(function (data) {
            if (data.length == 0) {
              Notification.warning(languages.findKey('noSendTextMessages'));
            } else {
              vm.lockDataTable = new NgTableParams({
                count: 8,
                sorting: {sendTime: 'desc'}
              }, {
                dataset: data
              });
            }
          }, function (reason) {
            Notification.error(languages.findKey('getFail'));
          })
        } else if(type == 2) { // MQTT
          var restURL = MQTT_SEND_RECORD_PAGED_QUERY;
          if (deviceNum&&!angular.isUndefined(deviceNum)) {
            restURL += "?deviceNum=" + $filter('uppercase')(deviceNum);
          } else {
            Notification.warning(languages.findKey("deviceNumNull"));
            return;
          }
          var operationLogPromis = serviceResource.restCallService(restURL, "QUERY");
          operationLogPromis.then(function (data) {
            if (data.length == 0) {
              Notification.warning(languages.findKey('noData'));
            } else {
              vm.lockDataTable = new NgTableParams({
                count: 8,
                sorting: {sendTime: 'desc'}
              }, {
                dataset: data
              });
            }
          }, function (reason) {
            Notification.error(languages.findKey('getFail'));
          })
        }

      }
    }
})();





