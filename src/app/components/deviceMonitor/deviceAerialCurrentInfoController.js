(function () {
    'use strict';
    angular
        .module('GPSCloud')
        .controller('deviceAerialCurrentInfoController', deviceAerialCurrentInfoController);

    /** @ngInject */
    function deviceAerialCurrentInfoController($rootScope, $scope,$http, $location, $timeout, $filter, $uibModalInstance, $confirm,permissions,
                                               Notification, serviceResource, SEND_SMS_EMCLOUD_URL, DEIVCIE_UNLOCK_FACTOR_URL,DEVCE_DATA_PAGED_QUERY,BATTERY_CHART_DATA,BATTERY_FORM_DATA,
                                               VIEW_SMS_EMCLOUD_URL,AMAP_GEO_CODER_URL,MACHINE_FENCE,deviceinfo,DEVCE_CHARGER_DATA,DEVCEINFO_PARAMETER_URL,
                                               DEVCEMONITOR_SIMPLE_DATA_PAGED_QUERY,DEVCEMONITOR_WARNING_DATA_PAGED_QUERY,MACHINE_FENCE_CACHE,DEVCEDATA_EXCELEXPORT) {
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

        if(deviceinfo.machine!=null&&deviceinfo.machine.selectAddress!=null
            &&deviceinfo.machine.amaplongitudeNum!=null&&deviceinfo.machine.amaplatitudeNum!=null
            &&deviceinfo.machine.radius!=null){
            vm.selectAddress=deviceinfo.machine.selectAddress; //选中的地址信息
            vm.amaplongitudeNum=deviceinfo.machine.amaplongitudeNum;//选中的经度
            vm.amaplatitudeNum=deviceinfo.machine.amaplatitudeNum;//选中的维度
            vm.radius=deviceinfo.machine.radius; //设置的半径
        }

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
            title: '电压',
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
        vm.serverHost = "iot.nvr-china.com";
        vm.serverPort = "08090";
        vm.startTimes = vm.deviceinfo.startTimes;
        vm.catPhoneNumber='13853108000';
        vm.workHours = $filter('number')(vm.deviceinfo.totalDuration, 1);
        if (vm.workHours != null) {
            vm.workHours = vm.workHours.replace(/,/g, '');  //去掉千位分隔符
        }
        //vm.secOutPower =
        //secLocateInt
        //secInnerPower
        //判断用户是否有权限
        if (permissions.getPermissions("device:remoteControl")) {
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
        vm.sendSMS = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber,vehicleStateCollect,chargerStateCollect) {

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
            $confirm({text: '确定要发送此短信吗?', title: '短信发送确认', ok: '确定', cancel: '取消'})
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
        }

        //默认显示当前设备的最新地址
        vm.initMapTab = function(deviceInfo){

            $timeout(function(){
                var deviceInfoList = new Array();
                deviceInfoList.push(deviceInfo);
            //    alert("deviceInfo.amaplongitudeNum=="+deviceInfo.amaplongitudeNum+", deviceInfo.amaplatitudeNum="+deviceInfo.amaplatitudeNum)
                if(null!=deviceInfo.amaplongitudeNum&null!=deviceInfo.amaplatitudeNum){
                    var centerAddr = [deviceInfo.amaplongitudeNum,deviceInfo.amaplatitudeNum];
                }


                serviceResource.refreshMapWithDeviceInfo("deviceDetailMap",deviceInfoList,17,centerAddr);
            })
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

            vm.scopeMap=map;
            return map;
        };

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
            var marker, circle, circleEditor;
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

                    vm.initScopeMapTab(deviceinfo);

                });


                //读取所有设备的gps信息，home map使用
                if (deviceInfo.locateStatus === '1' && deviceInfo.amaplongitudeNum != null && deviceInfo.amaplatitudeNum != null) {
                  vm.addMarkerModelEmcloud(map,deviceInfo,"https://webapi.amap.com/images/marker_sprite.png");
                }

                //回显围栏坐标
                if(vm.amaplongitudeNum!=null&&vm.amaplatitudeNum!=null){
                  var lnglatXY=[vm.amaplongitudeNum, vm.amaplatitudeNum];

                  circle = createCircle(lnglatXY);
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

                }



            })
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
                Notification.error('无效的地址');
                return false;
            }
            if(!vm.amaplongitudeNum&&typeof(vm.amaplongitudeNum)=="undefined"){
                Notification.error('无效的经度');
                return false;
            }
            if(!vm.amaplatitudeNum&&typeof(vm.amaplatitudeNum)=="undefined"){
                Notification.error('无效的维度');
                return false;
            }
            if(!vm.radius||typeof(vm.radius)=="undefined"||isNaN(vm.radius)){
                Notification.error('无效的半径');
                return false;
            }

            var text="距离: "+vm.radius+"(米),   地址: "+vm.selectAddress+",  坐标: 经度 "+vm.amaplongitudeNum+" 维度 "+vm.amaplatitudeNum +" "
            $confirm({text: text,title: '围栏设置确认', ok: '确定', cancel: '取消'})
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
        $confirm({text: text, title: '取消电子围栏', ok: '确定', cancel: '取消'})
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


            vm.refreshLocationList = function(value) {
             //   alert(11);
                vm.locationList=[];
                AMap.service(["AMap.Autocomplete"], function() { //加载地理编码
                    var autocomplete = new AMap.Autocomplete({
                        city: "", //城市，默认全国
                        input: "",//使用联想输入的input的id
                    });


                    //
                    autocomplete.search(value, function(status, result) {
                    });

                    AMap.event.addListener(autocomplete, "complete", complete);//注册监听，当选中某条记录时会触发
                    function complete(result) {
                        vm.locationList=result.tips;
                    }

                });
            },

            vm.onSelectCallback = function (item, model){

                AMap.service(["AMap.PlaceSearch"], function() { //加载地理编码
                    var placeSearch = new AMap.PlaceSearch({
                        map: vm.scopeMap


                    });  //构造地点查询类



                    placeSearch.setCity(item.adcode);
                    placeSearch.search(item.name,function(status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            placeSearch_CallBack(result);
                        }

                    });


                    //回调函数
                    function placeSearch_CallBack(data) {
                        var lnglatXY = [item.location.lng, item.location.lat];
                        var marker = new AMap.Marker({
                          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                          position: lnglatXY
                        });
                        var poi = {location: item.location, name: item.district, address: item.district + item.address};
                        vm.createMarker(marker, poi);
                        vm.updateLocationInfo(poi.address, lnglatXY); //更新选中的地址信息
                    }


                });
            };

        vm.getLocation=function(address){
            var geocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: "all"
            });


            geocoder.getLocation(address, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {

                    var resultStr = "";
                    var  lnglatXY;
                    //地理编码结果数组
                    var geocode = result.geocodes;
                    for (var i = 0; i < geocode.length; i++) {
                        //拼接输出html
                        resultStr += "<span style=\"font-size: 12px;padding:0px 0 4px 2px; border-bottom:1px solid #C1FFC1;\">" + "<b>地址</b>：" + geocode[i].formattedAddress + "" + "&nbsp;&nbsp;<b>的地理编码结果是:</b><b>&nbsp;&nbsp;&nbsp;&nbsp;坐标</b>：" + geocode[i].location.getLng() + ", " + geocode[i].location.getLat() + "" + "<b>&nbsp;&nbsp;&nbsp;&nbsp;匹配级别</b>：" + geocode[i].level + "</span>";
                        lnglatXY=[geocode[i].location.getLng(), geocode[i].location.getLat()];
                        vm.addMarker(vm.scopeMap,i, geocode[i]);
                    }

                }
            });
        },


        //默认显示当前设备的最新地址
        vm.initScopeMapTab = function(deviceInfo){

            if (!permissions.getPermissions("device:scopeMapPage")) {
                return;
            }

            $timeout(function(){
                //第一个标注
                var centerAddr;
                // 若已定位,则标注为定位点;若未定位,则标注为围栏中心点
                if(1==deviceInfo.locateStatus && null!=deviceInfo.amaplongitudeNum && null!=deviceInfo.amaplatitudeNum){
                    centerAddr = [deviceInfo.amaplongitudeNum,deviceInfo.amaplatitudeNum];
                } else {
                    centerAddr = [vm.amaplongitudeNum,vm.amaplatitudeNum];
                }


                //第一个标注
                vm.refreshScopeMapWithDeviceInfo("deviceScopeMap",deviceInfo,15,centerAddr);



            })
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
              content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
            });
            startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
          });
          /*开始事件*/
          AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
            lastDistabce = 0;
            marker.setLabel({
              offset: new AMap.Pixel(-10, -25),
              content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
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
              content: "行使了: " + distabcess2 + "&nbsp&nbsp" + "米"
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
                    Notification.error("查询数据出错");
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
        vm.getDeviceData = function(page,size,sort,deviceNum,startDate,endDate){
          //  $location.search({'page':page||0,'size':size||20,'sort':sort||''});
            if (vm.operatorInfo){

                var queryCondition;
                if (deviceNum){
                    queryCondition = "&deviceNum=" + deviceNum;
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
                Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
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
                Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
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
                    vm.page = data.page;
                    vm.deviceData_pagenumber = data.page.number + 1;
                    vm.basePath = "device/devicedata";
                  }else {
                    Notification.warning("暂无数据！");
                  }
                },function(reason){
                    serviceResource.handleRsp("获取数据失败",reason);
                    vm.deviceInfoList = null;
                });
            }


        };

        vm.deviceDataDownload = function (deviceNum, startDate, endDate) {
          if (deviceNum) {
            var filterTerm = "deviceNum=" + deviceNum;
          }else {
            Notification.error("输入的设备编号有误");
            return;
          }

          if (startDate) {
            filterTerm += "&startDate=" + $filter('date')(startDate, 'yyyy-MM-dd HH:mm:ss');

          }else {
            Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
            return;
          }

          if (endDate) {
            filterTerm += "&endDate=" + $filter('date')(endDate, 'yyyy-MM-dd HH:mm:ss');

          }else {
            Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
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
            anchor.attr({
              href: objectUrl,
              target: '_blank',
              download: deviceNum +'.xls'
            })[0].click();

          }).error(function (data, status, headers, config) {
            Notification.error("下载失败!");
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
                  serviceResource.handleRsp("获取报警数据失败", reason);
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
            type:'01',name:'设备状态'
        },{
            type:'02',name:'报警信息'
        },{
            //2016-07-11 由市电电压调整成蓄电池组电压
            type:'03',name:'蓄电池组电压'
        }];

        vm.queryType=vm.queryTypeData[0].type;

        vm.simpleConfig = {
          options: {
            chart: {
              type: 'scatter',
              zoomType: 'xy',
              width: 840
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
              labelFormat: '{name}' + '<br><b>绿色：工作</b><br><b>黄色：空闲 </b><br>'
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
                      return '<b>工作状态</b><br>' + datefmt + ' ' + fmtData;
                    } else if (this.color == '#f7a35c') {
                      return '<b>空闲状态</b><br>' + datefmt + ' ' + fmtData;
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
              text: '日期'
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
              text: '时间'
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
            name: '工作状态',
            marker: {
              symbol: 'circle'
            },
            turboThreshold: 200000,
            data: []
          }],
          title: {
            text: '工作状态热点分布'
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
              width: 840
              //height: 250
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
              text: '日期'
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
              text: '报警时间'
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
            name: '报警信息',
            color: 'rgba(205, 51, 51, .5)',
            turboThreshold: 100000,
            data:[]
          }],
          title: {
            text: '报警信息'
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
              width: 840,
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
              text: '日期'
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
              text: '伏特(V)'
            },
            tickPositions: [0, 5, 10, 15, 20, 25, 30],
            labels: {
              formatter: function () {
                return this.value + 'V';
              }
            }
          },
          series: [{
            name: '蓄电池组电压',
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
            text: '蓄电池组电压变化'
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
                $confirm({text: '因数据量较大，若选择时间超过三天，查询可能会较慢，确认继续吗？', title: '消息提示', ok: '确认 ', cancel: '取消'}).then(
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

        //车辆参数
        vm.parameterConfig = {
            options: {
                chart: {
                    type: 'line',
                    zoomType: 'xy',
                    width: 840,
                },
                credits: {
                    text: 'nvr-china',
                    href: 'http://www.nvr-china.com/'
                },
                exporting: false,
                legend: {
                    enabled: false
                }
            },
            title: {
                text: false
            },
            xAxis: {
                min: -127,
                max: 127,
                gridLineColor: '#197F07',
                gridLineWidth: 1
            },
            yAxis: {
                min: 0,
                max: 100,
                title: false,
                gridLineColor: '#197F07',
                gridLineWidth: 1
            },
            series: [{
                name: 'value',
                data: []
            },{
                name: 'value',
                data: []
            }],
            loading: false,
            func: function (chart) {
                $timeout(function () {
                    chart.reflow();
                }, 0);
            }
        };

        vm.refreshParameterChart = function (parameterValue,curve) {
            var bIndex1 = curve.bIndex1;

            if(bIndex1 < parameterValue.bJoystickNeutralZone){
                bIndex1 = parameterValue.bJoystickNeutralZone;
            }

            var data1 = [bIndex1,curve.bPwmPos1];
            var data2 = [curve.bIndex2,curve.bPwmPos2];
            var data3 = [curve.bIndex3,curve.bPwmPos3];
            var data4 = [curve.bIndex4,curve.bPwmPos4];
            var data5 = [127,curve.bPwmPosMax];
            var data6 = [-bIndex1,curve.bPwmNeg1];
            var data7 = [-curve.bIndex2,curve.bPwmNeg2];
            var data8 = [-curve.bIndex3,curve.bPwmNeg3];
            var data9 = [-curve.bIndex4,curve.bPwmNeg4];
            var data10 = [-127,curve.bPwmNegMax];

            vm.parameterConfig.series[0].data = [data1,data2,data3,data4,data5];
            vm.parameterConfig.series[1].data = [data6,data7,data8,data9,data10];
        };

        vm.initParameterTab = function (deviceinfo) {
            var restURL = DEVCEINFO_PARAMETER_URL + "?deviceNum=" + deviceinfo.deviceNum;
            var rspData = serviceResource.restCallService(restURL, "GET");
            rspData.then(function (data) {
                vm.parameterValue = data.content;

                vm.parameterTypeList=[{
                    name:'快速行走曲线',curve : vm.parameterValue.driveFastCurve
                },{
                    name:'起升后行走曲线',curve : vm.parameterValue.driveRisedCurve
                },{
                    name:'上升曲线',curve : vm.parameterValue.liftUpCurve
                },{
                    name:'慢速行走曲线',curve : vm.parameterValue.driveSlowCurve
                },{
                    name:'转向曲线',curve : vm.parameterValue.steerRisedCurve
                }];

                vm.queryParameter = vm.parameterTypeList[0];
                vm.refreshParameterChart(vm.parameterValue,vm.queryParameter.curve);
            }, function (reason) {
                Notification.error('获取车辆参数失败');
                Notification.error(reason.data.message);
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
            Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
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
            Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
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
            text: '电池充电监控'
          }
        }
      };
      vm.batteryOut = {
        options: {
          title: {
            text: '电池放电监控'
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
              text: '电池充电监控'
            },
            xAxis: {
              type: 'datetime',
              categories:time,
              title: {
                enabled: true,
                text: '日期'
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
                text: '电压 (V)',
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
                var s = '<b>' + $filter('date')(new Date(this.x), 'yyyy-MM-dd HH:mm:ss'); + '</b>';
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
              text: '电池放电监控'
            },
            xAxis: {
              type: 'datetime',
              categories:time,
              title: {
                enabled: true,
                text: '日期'
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
                text: '电压 (V)',
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
                var s = '<b>' + $filter('date')(new Date(this.x), 'yyyy-MM-dd HH:mm:ss'); + '</b>';
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

    }
})();





