(function () {
    'use strict';
    angular
        .module('GPSCloud')
        .controller('deviceAerialCurrentInfoController', deviceAerialCurrentInfoController);

    /** @ngInject */
    function deviceAerialCurrentInfoController($rootScope, $scope, $location, $timeout, $filter, $uibModalInstance, $confirm,permissions,
                                         Notification, serviceResource, AMAP_URL,DEVCE_SIMPLE_DATA_PAGED_QUERY, SEND_SMS_EMCLOUD_URL, DEIVCIE_UNLOCK_FACTOR_URL,DEVCE_DATA_PAGED_QUERY,
                                         VIEW_SMS_EMCLOUD_URL,AMAP_GEO_CODER_URL,MACHINE_FENCE,deviceinfo,DEVCE_CHARGER_DATA) {
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

        vm.scopeMap;
        vm.locationList=[];
        vm.selectPosition;
        vm.selectAddress=''; //选中的地址信息
        vm.amaplongitudeNum;//选中的经度
        vm.amaplatitudeNum;//选中的维度
        vm.radius; //设置的半径

        if(deviceinfo.machine!=null&&deviceinfo.machine.selectAddress!=null
            &&deviceinfo.machine.amaplongitudeNum!=null&&deviceinfo.machine.amaplatitudeNum!=null
            &&deviceinfo.machine.radius!=null){
            vm.selectAddress=deviceinfo.machine.selectAddress; //选中的地址信息
            vm.amaplongitudeNum=deviceinfo.machine.amaplongitudeNum;//选中的经度
            vm.amaplatitudeNum=deviceinfo.machine.amaplatitudeNum;//选中的维度
            vm.radius=deviceinfo.machine.radius; //设置的半径
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
        vm.serverHost = "awp.nvr-china.com";
        vm.serverPort = "09999";
        vm.startTimes = vm.deviceinfo.startTimes;
        vm.catPhoneNumber='13853108000';
        vm.workHours = $filter('number')(vm.deviceinfo.totalDuration, 1);
        if (vm.workHours != null) {
            vm.workHours = vm.workHours.replace(/,/g, '');  //去掉千位分隔符
        }
        //vm.secOutPower =
        //secLocateInt
        //secInnerPower
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

        //检查短信参数
        vm.checkParam = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower) {
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
            }
            else if(type == 10){
                vm.terminalReset=sms;
            }
        }

        //得到短信内容
        vm.viewSMS = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber) {
            if (vm.checkParam(type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber) == false) {
                Notification.error("请提供要设置的参数");
                return;
            }
            var restURL = VIEW_SMS_EMCLOUD_URL + "?type=" + type + "&devicenum=" + vm.deviceinfo.deviceNum;
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
            }
            var rspData = serviceResource.restCallService(restURL, "GET");
            rspData.then(function (data) {
                vm.assginSMSContent(type, data.content);
            }, function (reason) {
                Notification.error('获取短信内容失败,' + reason.data.message);
            })
        }

        //发送短信
        vm.sendSMS = function (type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber) {
            if (vm.checkParam(type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower,catPhoneNumber) == false) {
                Notification.error("请提供要设置的参数");
                return;
            }
            var restURL = SEND_SMS_EMCLOUD_URL + "?type=" + type + "&devicenum=" + vm.deviceinfo.deviceNum;
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
            }
            $confirm({text: '确定要发送此短信吗?', title: '短信发送确认', ok: '确定', cancel: '取消'})
                .then(function () {
                    var rspData = serviceResource.restCallService(restURL, "ADD");  //post请求
                    rspData.then(function (data) {
                        if (data.code == 0 && data.content.smsStatus == 1) {
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


                serviceResource.refreshMapWithDeviceInfo("deviceDetailMap",deviceInfoList,12,centerAddr);
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
                center: localCenterAddr,
                zooms: [localZoomSize, 18]
            });
            //    alert(555);
            map.setZoom(1);
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

            vm.scopeMap=map;
            return map;
        };

        vm.updateLocationInfo=function(address,location){
            vm.selectAddress=address;

            vm.amaplongitudeNum=location[0];//选中的经度
            vm.amaplatitudeNum=location[1];//选中的维度

            $scope.$apply();


        };

        //查询设备数据并更新地图 mapid是DOM中地图放置位置的id
        vm.refreshScopeMapWithDeviceInfo=function (mapId,deviceInfo,zoomsize,centeraddr) {

            $LAB.script(AMAP_GEO_CODER_URL).wait(function () {

                var map=vm.initMap(mapId,zoomsize,centeraddr);


                var marker;

                map.on('click', function(e) {

                    var  lnglatXY=[e.lnglat.getLng(), e.lnglat.getLat()];
                    marker = new AMap.Marker({
                        icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                        position: lnglatXY
                    });
                    marker.setMap(map);

                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "all"
                    });

                    geocoder.getAddress(lnglatXY, function(status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            //       geocoder_CallBack(result);
                            var  address= result.regeocode.formattedAddress; //返回地址描述



                            var poi={location:lnglatXY,name:null,address: address};
                            vm.createMarker(poi);

                            vm.updateLocationInfo(address, lnglatXY);
                        }
                    });




                });


                //读取所有设备的gps信息，home map使用
                if (deviceInfo.locateStatus === '1' && deviceInfo.amaplongitudeNum != null && deviceInfo.amaplatitudeNum != null) {
                    serviceResource.addMarkerModel(map,deviceInfo,"https://webapi.amap.com/images/marker_sprite.png");
                }

                //围栏地址标注
                if(vm.amaplongitudeNum!=null&&vm.amaplatitudeNum!=null){
                    var  lnglatXY=[vm.amaplongitudeNum, vm.amaplatitudeNum];
                    marker = new AMap.Marker({
                        icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                        position: lnglatXY
                    });
                    marker.setMap(map);

                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "all"
                    });

                    geocoder.getAddress(lnglatXY, function(status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            //       geocoder_CallBack(result);
                            var  address= result.regeocode.formattedAddress; //返回地址描述

                            var poi={location:lnglatXY,name:null,address: address};
                            vm.createMarker(poi);

                            vm.updateLocationInfo(address, lnglatXY);
                        }
                    });
                    //围栏地址标注end
                }



            })
        },


             vm.createMarker=function(poi){
                // 添加marker
                var marker = new AMap.Marker({
                    map: vm.scopeMap,
                    position: poi.location
                });


                vm.scopeMap.setCenter(marker.getPosition());
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
            //s.push("取消围栏： <button class='btn btn-primary btn-xs' type='button' onclick=''>重置</button></b>");


            return s.join("<br>");
        }

        vm.updateScopeMap = function () {
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
                        amaplatitudeNum:vm.amaplatitudeNum
                    }
                    //TODO 保存电子围栏
                    var restResult = serviceResource.restAddRequest(MACHINE_FENCE,fence);
                    restResult.then(function (data) {
                            Notification.success("设置电子围栏成功!");
                            $uibModalInstance.close();
                        },function (reason) {
                            vm.errorMsg=reason.data.message;
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
                        var poiArr = data.poiList.pois;

                        for(var i=0;i<poiArr.length;i++){
                            vm.createMarker(poiArr[i]);

                            var  lnglatXY=[poiArr[i].location.getLng(), poiArr[i].location.getLat()];

                            vm.updateLocationInfo(poiArr[i].address, lnglatXY); //更新选中的地址信息
                        }


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
                if(null!=deviceInfo.amaplongitudeNum&null!=deviceInfo.amaplatitudeNum){
                    var centerAddr = [deviceInfo.amaplongitudeNum,deviceInfo.amaplatitudeNum];
                }


                //第一个标注
                vm.refreshScopeMapWithDeviceInfo("deviceScopeMap",deviceInfo,8,centerAddr);



            })
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
            $timeout(function(){
                $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
                    var marker, lineArr = [];
                    if (lineAttr){
                        lineArr = lineAttr;
                    }
                    var map = new AMap.Map("deviceDetailMap", {
                        resizeEnable: true,
                        //center: [116.397428, 39.90923],
                        zoom: 17
                    });
                    map.on("complete", completeEventHandler);
                    AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
                        marker.moveAlong(lineArr, 500);
                    }, false);
                    AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
                        marker.stopMove();
                    }, false);
                    var carPostion = [116.397428, 39.90923];   //默认地点
                    if (lineArr.length > 0){
                        carPostion = lineArr[0];
                    }
                    // 地图图块加载完毕后执行函数
                    function completeEventHandler() {
                        marker = new AMap.Marker({
                            map: map,
                            position: carPostion,
                            //icon: "http://code.mapabc.com/images/car_03.png",
                            icon: "assets/images/car_03.png",
                            offset: new AMap.Pixel(-26, -13),
                            autoRotation: true
                        });
                        // 绘制轨迹
                        var polyline = new AMap.Polyline({
                            map: map,
                            path: lineArr,
                            strokeColor: "#00A",  //线颜色
                            strokeOpacity: 1,     //线透明度
                            strokeWeight: 3,      //线宽
                            strokeStyle: "solid"  //线样式
                        });
                        map.setFitView();
                    }
                })
            })
        };

        //设备路径数据
        vm.getDeviceMapData = function(page,size,sort,deviceNum,startDate,endDate){
            if (deviceNum){
                var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
            }
            if (startDate){
                var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
                var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
                if (filterTerm){
                    filterTerm += "&startDate=" + startDateFormated
                }
                else{
                    filterTerm += "startDate=" + startDateFormated;
                }
            }
            if (endDate){
                var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
                var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
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
        startDate.setDate(startDate.getDate()-5);
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
        startDate.setDate(startDate.getDate()-5);
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

                var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
                var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
                if (startDate){
                    queryCondition = queryCondition + "&startDate=" + startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
                }
                if (endDate){
                    queryCondition = queryCondition + "&endDate=" + endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
                }
               // var search = $location.search();

                var restCallURL = DEVCE_SIMPLE_DATA_PAGED_QUERY;
                var pageUrl = page || 0;
                var sizeUrl = size || 100;
                var sortUrl = sort || "recordTime,desc";
                restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;


                if (queryCondition){
                    restCallURL = restCallURL + queryCondition
                }
                var rspData = serviceResource.restCallService(restCallURL, "GET");
               // return rspData;

               // var rspData = serviceResource.getDeviceSimpleData(vm.operatorInfo,deviceinfo.deviceNum,startDate,endDate);
                rspData.then(function(data){
                    var index;
                    vm.noWorkingDeviceDataList = new Array();
                    vm.workingDeviceDataList = new Array();
                    var dotData = new Array();
                    for(index = 0; index < data.content.length; index++){
                        var recordDateTimeY = new Date(data.content[index].recordTime);
                        var recordDate = recordDateTimeY.getFullYear().toString() + serviceResource.padLeft('00',recordDateTimeY.getMonth()+1,true) + serviceResource.padLeft('00',recordDateTimeY.getDate(),true);
                        var recordTime = serviceResource.padLeft('00',recordDateTimeY.getHours().toString(),true) + serviceResource.padLeft('00',recordDateTimeY.getMinutes(),true) + serviceResource.padLeft('00',recordDateTimeY.getSeconds(),true);
                        var machineStatus = data.content[index].machineStatus;
                        dotData = {
                            id: data.content[index].id,    //id can be used to query detail device data
                            x: Number(recordDate),
                            y: Number(recordTime)};
                        if (machineStatus === 0){

                            vm.workingDeviceDataList.push(dotData);
                        }  //power on
                        if (machineStatus === 1){
                            vm.noWorkingDeviceDataList.push(dotData);
                        }  //power off
                    }



                    var chart=vm.simpleConfig;
                    chart.series[0].data = vm.noWorkingDeviceDataList;
                    chart.series[1].data = vm.workingDeviceDataList;
                    //chart.series.push({
                    //    data: vm.noWorkingDeviceDataList
                    //});
                    //
                    //chart.series.push({
                    //    data: vm.workingDeviceDataList
                    //});

                    //var chart = $('#hot').highcharts();
                    //chart.series[0].setData(vm.noWorkingDeviceDataList,true);  //3rd parameter is refresh
                    //chart.series[1].setData(vm.workingDeviceDataList,true);
                },function(reason){
                    serviceResource.handleRsp("获取运行数据失败",reason);
                    vm.noWorkingDeviceDataList = null;
                    vm.workingDeviceDataList = null;
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


                var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
                var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
                if (startDate){
                    queryCondition = queryCondition + "&startDate=" + startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
                }
                if (endDate){
                    queryCondition = queryCondition + "&endDate=" + endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
                }

                var restCallURL = DEVCE_DATA_PAGED_QUERY;
                var pageUrl = page || 0;
                var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
                var sortUrl = sort || "recordTime,desc";
                restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

                if (queryCondition){
                    restCallURL = restCallURL + queryCondition
                }

                var rspData = serviceResource.restCallService(restCallURL, "GET");

                rspData.then(function(data){
                    vm.deviceDataList = data.content;
                    vm.page = data.page;
                    vm.deviceData_pagenumber = data.page.number + 1;
                    vm.basePath = "device/devicedata";
                },function(reason){
                    serviceResource.handleRsp("获取数据失败",reason);
                    vm.deviceInfoList = null;
                });
            }


        };


        //warning data
        vm.getDeviceWarningData = function(deviceNum,startDate,endDate){
            if (vm.operatorInfo){
                var rspData = serviceResource.getDeviceWarningData(vm.operatorInfo,deviceNum,startDate,endDate);
                rspData.then(function(data){
                    var index;
                    vm.warningDataList = new Array();
                    var dotData = new Array();
                    for(index = 0; index < data.content.length; index++){
                        var recordDateTimeY = new Date(data.content[index].warningTime);  //should be warningTime, recordTime for testing
                        var recordDate = recordDateTimeY.getFullYear().toString() + serviceResource.padLeft('00',recordDateTimeY.getMonth()+1,true) + serviceResource.padLeft('00',recordDateTimeY.getDate(),true);
                        var recordTime = serviceResource.padLeft('00',recordDateTimeY.getHours().toString(),true) + serviceResource.padLeft('00',recordDateTimeY.getMinutes(),true) + serviceResource.padLeft('00',recordDateTimeY.getSeconds(),true);
                        dotData = {
                            id: data.content[index].id,    //id can be used to query detail device data
                            warningMsg: serviceResource.getWarningInfo(data.content[index].warningCode),
                            x: Number(recordDateTimeY),
                            y: Number(recordTime)
                        };

                        vm.warningDataList.push(dotData);
                    }
                    //     var chart = $('#hot-warning').highcharts();
                    var chart=vm.warningConfig;
                    //chart.series.push({
                    //    data: vm.warningDataList
                    //});  //3rd parameter is refresh

                    chart.series[0].data = vm.warningDataList;
                },function(reason){
                    serviceResource.handleRsp("获取报警数据失败",reason);
                    vm.warningDataList = null;
                });
            }
        };

        //charger data
        vm.getDeviceChargerData = function(deviceNum,startDate,endDate){
            if (vm.operatorInfo){

                var queryCondition;
                if (deviceNum){
                    queryCondition = "?deviceNum=" + deviceNum;
                }

                var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
                var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
                if (startDate){
                    queryCondition = queryCondition + "&startDate=" + startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
                }
                if (endDate){
                    queryCondition = queryCondition + "&endDate=" + endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
                }

                var restCallURL = DEVCE_CHARGER_DATA;

                if (queryCondition){
                    restCallURL = restCallURL + queryCondition
                }
                var rspData = serviceResource.restCallService(restCallURL, "GET");

                rspData.then(function(data){
                    var index;
                    vm.voltageList = new Array();
                    var dotData = new Array();
                    for(index = 0; index < data.content.length; index++){
                        var recordTime = data.content[index].recordTime;
                        var voltage = data.content[index].voltage;
                        dotData = {
                            id: data.content[index].id,    //id can be used to query detail device data
                            x: recordTime,
                            y: Number(voltage)
                        };

                        vm.voltageList.push(dotData);
                    }

                    var chart=vm.voltageConfig;
                    chart.series[0].data = vm.voltageList;
                },function(reason){
                    serviceResource.handleRsp("获取运行数据失败",reason);
                    vm.noWorkingDeviceDataList = null;
                    vm.workingDeviceDataList = null;
                });
            }
        };

        vm.queryTypeData=[{
            type:'01',name:'设备状态'
        },{
            type:'02',name:'报警信息'
        },{
            type:'03',name:'市电电压'
        }];

        vm.queryType=vm.queryTypeData[0].type;

        vm.simpleConfig ={
            title: {
                text:'工作状态热点分布'
            }
        };
        vm.warningConfig = {
            title: {
                text:'报警信息'
            }
        };
        vm.voltageConfig = {
            title: {
                text:'市电电压变化'
            }
        };

        var curDate = new Date();
        vm.startDate = new Date(curDate-48*3600*1000);

        vm.refreshPageDate = function(queryType,deviceNum,startDate,endDate){
             if(Math.floor((endDate-startDate)/24/3600/1000)>2){
                 $confirm({text: '因数据量较大，若选择时间超过三天，查询可能会较慢，确认继续吗？', title: '消息提示', ok: '确认 ', cancel: '取消'},{shade:false}).then(

                     function () {
                         if (queryType !='01' && queryType !='02' && queryType !='03'){
                             Notification.error("请选择查询类型！");
                         }else if (queryType=='01'){
                             //设备状态
                             vm.getDeviceSimpleData(null,null,null,deviceNum,startDate,endDate);

                             vm.simpleConfig={
                                 options: {
                                     chart: {
                                         type: 'scatter',
                                         zoomType: 'xy',
                                         width: 840,
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
                                                 shared : true,
                                                 pointFormatter: function(){
                                                     var datedata = this.y.toString();
                                                     var padDate = serviceResource.padLeft('000000',datedata,true);
                                                     var fmtData = padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                                     return this.x.toString() + ' ' + fmtData;
                                                 }
                                             }

                                         }
                                     },
                                 },

                                 xAxis: {
                                     title: {
                                         enabled: true,
                                         text: '日期'
                                     },
                                     startOnTick: true,
                                     endOnTick: true,
                                     showLastLabel: true,
                                     tickInterval: 1,
                                     labels: {
                                         formatter: function () {
                                             var datefmt = this.value;
                                             return datefmt.toString();
                                         }
                                     }
                                 },
                                 yAxis: {
                                     title: {
                                         text: '时间'
                                     },
                                     labels: {
                                         formatter: function () {
                                             var datefmt = this.value;
                                             var padDate = serviceResource.padLeft('000000',datefmt,true);

                                             return padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                         }
                                     }
                                 },

                                 series: [{
                                     name: '空闲状态',
                                     color: 'rgba(223, 83, 83, .5)',
                                     data: vm.noWorkingDeviceDataList,
                                     turboThreshold: 100000
                                     //data: []

                                 }, {
                                     name: '工作状态',
                                     color: 'rgba(119, 152, 191, .5)',
                                     data: vm.workingDeviceDataList,
                                     turboThreshold: 100000
                                 }],

                                 title: {
                                     text: '工作状态热点分布'
                                 },
                                 loading: false,
                                 // function to trigger reflow in bootstrap containers
                                 // see: http://jsfiddle.net/pgbc988d/ and https://github.com/pablojim/highcharts-ng/issues/211
                                 func: function(chart) {
                                     $timeout(function() {
                                         chart.reflow();
                                         //The below is an event that will trigger all instances of charts to reflow
                                         //vm.$broadcast('highchartsng.reflow');
                                     }, 0);

                                 }
                             };

                         }else if (queryType=='02'){
                             //报警信息
                             vm.getDeviceWarningData(deviceNum,startDate,endDate);

                             vm.warningConfig = {
                                 options: {
                                     chart: {
                                         type: 'scatter',
                                         zoomType: 'xy',
                                         width: 840,
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
                                                 shared : true,
                                                 pointFormatter: function(){
                                                     var recordDate = new Date(this.x)
                                                     var recordTime = this.y;
                                                     var padDate = serviceResource.padLeft('000000',recordTime,true);
                                                     var timefmt= padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                                     var datefmt = recordDate.getFullYear().toString() + '-' + serviceResource.padLeft('00',recordDate.getMonth()+1,true) + '-' +  serviceResource.padLeft('00',recordDate.getDate(),true);
                                                     return '<b>日期: </b>'+datefmt+'<br><b>时间: </b>'+timefmt+'<br><b>描述: </b>' + this.warningMsg.description + '<br><b>处理方法: </b>' + this.warningMsg.action ;
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
                                             cursor: "pointer",
                                             //events: {
                                             //    click: function(e) {
                                             //        vm.warningInfo = vm.getWarningInfo(e.point.y);
                                             //        vm.$apply();
                                             //    }
                                             //}
                                         }

                                     }
                                 },
                                 //时间转为string格式显示处理
                                 xAxis: {
                                     title: {
                                         enabled: true,
                                         text: '日期'
                                     },
                                     startOnTick: true,
                                     endOnTick: true,
                                     showLastLabel: true,
                                     tickInterval: 24 * 3600 * 1000,
                                     type: 'datetime',
                                     labels: {
                                         formatter: function () {
                                             var recordDateTimeY = new Date(this.value)
                                             var datefmt = recordDateTimeY.getFullYear().toString() + serviceResource.padLeft('00',recordDateTimeY.getMonth()+1,true) + serviceResource.padLeft('00',recordDateTimeY.getDate(),true);
                                             return datefmt.toString();
                                         }
                                     }
                                 },
                                 yAxis: {
                                     title: {
                                         text: '报警时间'
                                     },
                                     dateTimeLabelFormats: {
                                         second: '%HH:%MM:%SS',
                                     },
                                     labels: {
                                         formatter: function () {
                                             var datefmt = this.value;
                                             var padDate = serviceResource.padLeft('000000',datefmt,true);
                                             return padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                         }
                                     }

                                 },
                                 series: [{
                                     name: '报警信息',
                                     color: 'rgba(205, 51, 51, .5)',
                                     data: vm.warningDataList,
                                     turboThreshold:100000

                                 }],
                                 title: {
                                     text: '报警信息'
                                 },
                                 loading: false,
                                 func: function(chart) {
                                     $timeout(function() {
                                         chart.reflow();
                                     }, 0);
                                 }
                             };

                         }else if (vm.queryType=='03'){
                             //市电电压
                             vm.getDeviceChargerData(deviceNum,startDate,endDate);

                             vm.voltageConfig={
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
                                             return datefmt.getFullYear()+ '-' + serviceResource.padLeft('00',datefmt.getMonth()+1,true) + '-' + datefmt.getDate() + ' ' + datefmt.getHours()+'H';
                                         },
                                         enabled:true
                                     }
                                 },
                                 yAxis: {
                                     title: {
                                         text: '伏特(V)'
                                     },
                                     labels: {
                                         formatter: function () {
                                             return this.value + 'V';
                                         }
                                     }
                                 },

                                 series: [{
                                     name: '市电电压',
                                     color: 'rgba(223, 83, 83, .5)',
                                     data: vm.voltageList,
                                     turboThreshold: 100000,
                                     tooltip: {
                                         headerFormat: '<b>{series.name}</b><br>',
                                         shared : true,
                                         pointFormatter: function(){
                                             var datefmt = new Date(this.x);
                                             var xDate = datefmt.getFullYear()+ '-' + (datefmt.getMonth()+1) + '-' + datefmt.getDate();
                                             var xTime = datefmt.getHours()+ ':' + datefmt.getMinutes() + ':' + datefmt.getSeconds() + '.' + datefmt.getMilliseconds();
                                             return '<b>日期: </b>'+xDate+'<br><b>时间: </b>'+xTime+'<br><b>电压: </b>'+this.y+'V'+'<br>';
                                         }
                                     }
                                 }],

                                 title: {
                                     text: '市电电压变化'
                                 },
                                 loading: false,
                                 // function to trigger reflow in bootstrap containers
                                 // see: http://jsfiddle.net/pgbc988d/ and https://github.com/pablojim/highcharts-ng/issues/211
                                 func: function(chart) {
                                     $timeout(function() {
                                         chart.reflow();
                                         //The below is an event that will trigger all instances of charts to reflow
                                         //vm.$broadcast('highchartsng.reflow');
                                     }, 0);

                                 }
                             };

                         }
                     }
                 )

             }else{
                 if (queryType !='01' && queryType !='02' && queryType !='03'){
                     Notification.error("请选择查询类型！");
                 }else if (queryType=='01'){
                     //设备状态
                     vm.getDeviceSimpleData(null,null,null,deviceNum,startDate,endDate);

                     vm.simpleConfig={
                         options: {
                             chart: {
                                 type: 'scatter',
                                 zoomType: 'xy',
                                 width: 840,
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
                                         shared : true,
                                         pointFormatter: function(){
                                             var datedata = this.y.toString();
                                             var padDate = serviceResource.padLeft('000000',datedata,true);
                                             var fmtData = padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                             return this.x.toString() + ' ' + fmtData;
                                         }
                                     }

                                 }
                             },
                         },

                         xAxis: {
                             title: {
                                 enabled: true,
                                 text: '日期'
                             },
                             startOnTick: true,
                             endOnTick: true,
                             showLastLabel: true,
                             tickInterval: 1,
                             labels: {
                                 formatter: function () {
                                     var datefmt = this.value;
                                     return datefmt.toString();
                                 }
                             }
                         },
                         yAxis: {
                             title: {
                                 text: '时间'
                             },
                             labels: {
                                 formatter: function () {
                                     var datefmt = this.value;
                                     var padDate = serviceResource.padLeft('000000',datefmt,true);

                                     return padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                 }
                             }
                         },

                         series: [{
                             name: '空闲状态',
                             color: 'rgba(223, 83, 83, .5)',
                             data: vm.noWorkingDeviceDataList,
                             turboThreshold: 100000
                             //data: []

                         }, {
                             name: '工作状态',
                             color: 'rgba(119, 152, 191, .5)',
                             data: vm.workingDeviceDataList,
                             turboThreshold: 100000
                         }],

                         title: {
                             text: '工作状态热点分布'
                         },
                         loading: false,
                         // function to trigger reflow in bootstrap containers
                         // see: http://jsfiddle.net/pgbc988d/ and https://github.com/pablojim/highcharts-ng/issues/211
                         func: function(chart) {
                             $timeout(function() {
                                 chart.reflow();
                                 //The below is an event that will trigger all instances of charts to reflow
                                 //vm.$broadcast('highchartsng.reflow');
                             }, 0);

                         }
                     };

                 }else if (queryType=='02'){
                     //报警信息
                     vm.getDeviceWarningData(deviceNum,startDate,endDate);

                     vm.warningConfig = {
                         options: {
                             chart: {
                                 type: 'scatter',
                                 zoomType: 'xy',
                                 width: 840,
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
                                         shared : true,
                                         pointFormatter: function(){
                                             var recordDate = new Date(this.x)
                                             var recordTime = this.y;
                                             var padDate = serviceResource.padLeft('000000',recordTime,true);
                                             var timefmt= padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);

                                             var datefmt = recordDate.getFullYear().toString() + '-' + serviceResource.padLeft('00',recordDate.getMonth()+1,true) + '-' +  serviceResource.padLeft('00',recordDate.getDate(),true);
                                             return '<b>日期: </b>'+datefmt+'<br><b>时间: </b>'+timefmt+'<br><b>描述: </b>' + this.warningMsg.description + '<br><b>处理方法: </b>' + this.warningMsg.action ;
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
                                     cursor: "pointer",
                                     //events: {
                                     //    click: function(e) {
                                     //        vm.warningInfo = vm.getWarningInfo(e.point.y);
                                     //        vm.$apply();
                                     //    }
                                     //}
                                 }

                             }
                         },
                         //时间转为string格式显示处理
                         xAxis: {
                             title: {
                                 enabled: true,
                                 text: '日期'
                             },
                             startOnTick: true,
                             endOnTick: true,
                             showLastLabel: true,
                             tickInterval: 24 * 3600 * 1000,
                             type: 'datetime',
                             labels: {
                                 formatter: function () {
                                     var recordDateTimeY = new Date(this.value)
                                     var datefmt = recordDateTimeY.getFullYear().toString() + serviceResource.padLeft('00',recordDateTimeY.getMonth()+1,true) + serviceResource.padLeft('00',recordDateTimeY.getDate(),true);

                                     return datefmt.toString();
                                 }
                             }
                         },
                         yAxis: {
                             title: {
                                 text: '报警时间'
                             },
                             dateTimeLabelFormats: {
                                 second: '%H:%M:%S',
                             },
                             labels: {
                                 formatter: function () {
                                     var datefmt = this.value;
                                     var padDate = serviceResource.padLeft('000000',datefmt,true);

                                     return padDate.substr(0,2) + ':' + padDate.substr(2,2) + ':' + padDate.substr(4,2);
                                 }
                             }

                         },
                         series: [{
                             name: '报警信息',
                             color: 'rgba(205, 51, 51, .5)',
                             data: vm.warningDataList,
                             turboThreshold:100000

                         }],
                         title: {
                             text: '报警信息'
                         },
                         loading: false,
                         func: function(chart) {
                             $timeout(function() {
                                 chart.reflow();
                             }, 0);
                         }
                     };

                 }else if (vm.queryType=='03'){
                     //市电电压
                     vm.getDeviceChargerData(deviceNum,startDate,endDate);

                     vm.voltageConfig={
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
                                     return datefmt.getFullYear()+ '-' + serviceResource.padLeft('00',datefmt.getMonth()+1,true) + '-' + datefmt.getDate() + ' ' + datefmt.getHours()+'H';
                                 },
                                 enabled:true
                             }
                         },
                         yAxis: {
                             title: {
                                 text: '伏特(V)'
                             },
                             labels: {
                                 formatter: function () {
                                     return this.value + 'V';
                                 }
                             }
                         },

                         series: [{
                             name: '市电电压',
                             color: 'rgba(223, 83, 83, .5)',
                             data: vm.voltageList,
                             turboThreshold: 100000,
                             tooltip: {
                                 headerFormat: '<b>{series.name}</b><br>',
                                 shared : true,
                                 pointFormatter: function(){
                                     var datefmt = new Date(this.x);
                                     var xDate = datefmt.getFullYear()+ '-' + (datefmt.getMonth()+1) + '-' + datefmt.getDate();
                                     var xTime = datefmt.getHours()+ ':' + datefmt.getMinutes() + ':' + datefmt.getSeconds() + '.' + datefmt.getMilliseconds();
                                     return '<b>日期: </b>'+xDate+'<br><b>时间: </b>'+xTime+'<br><b>电压: </b>'+this.y+'V'+'<br>';
                                 }
                             }
                         }],

                         title: {
                             text: '市电电压变化'
                         },
                         loading: false,
                         // function to trigger reflow in bootstrap containers
                         // see: http://jsfiddle.net/pgbc988d/ and https://github.com/pablojim/highcharts-ng/issues/211
                         func: function(chart) {
                             $timeout(function() {
                                 chart.reflow();
                                 //The below is an event that will trigger all instances of charts to reflow
                                 //vm.$broadcast('highchartsng.reflow');
                             }, 0);

                         }
                     };

                 }

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



    }
})();





