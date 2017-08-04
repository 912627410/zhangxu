/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('serviceResource', serviceResource);

  /** @ngInject */

  function serviceResource($rootScope,$location,$resource,$http,$q,$uibModal,$window,$filter,permissions,Notification,languages,USER_LOGIN_URL,NOTIFICATION_STATISTICS_URL,DEVCE_MONITOR_SINGL_QUERY,
                           AMAP_URL,HOME_GPSDATA_URL,DEVCE_PAGED_QUERY,DEVCE_MONITOR_PAGED_QUERY,DEFAULT_SIZE_PER_PAGE,DEVCE_DATA_PAGED_QUERY,DEVCE_SIMPLE_DATA_PAGED_QUERY,
                           NOTIFICATION_PAGED_URL,USER_PAGED_URL,DEVCE_WARNING_DATA_PAGED_QUERY,DEFAULT_USER_SORT_BY,DEFAULT_NOTIFICATION_SORT_BY,
                           DEFAULT_DEVICE_SORT_BY,DEFAULT_DEVICE_DATA_SORT_BY,DEFAULT_DEVICE_WARNING_DATA_SORT_BY,DEFAULT_DEVICE_LOCK_DATA_SORT_BY,DEVCE_LOCK_DATA_PAGED_QUERY,AMAP_GEO_CODER_URL,PERMISSIONS_URL,USER_LOGINBYTOKEN_URL,
                           DEVCE_SIMPLE_GPS_DATA_PAGED_QUERY,HOME_GOOGLEMAPGPSDATA_URL) {
    var restCallService = function(URL,action,params){
      var restCall = $resource(URL);

      var defer = $q.defer();
      var succCallback = function(data){
        defer.resolve(data);
      };
      var failCallback = function(data){
        defer.reject(data);
      };
      if (action == "GET"){
        restCall.get(succCallback,failCallback);
      }
      //如果返回json是array的话需要用query，否则用get
      if (action == "QUERY"){
        restCall.query(succCallback,failCallback);
      }
      //POST
      if (action == "ADD"){
        restCall.save(params,succCallback,failCallback);
      }
      //PUT
      if (action == "UPDATE"){
        var restUpdateCall = $resource(URL,{},{'update': { method:'PUT' }});
        restUpdateCall.update(params,succCallback,failCallback);

      }


      return defer.promise
    };

    /*判断机器设备类型*/
    var mapDeviceType = function (item) {
      if (item == null) {
        return null;
      }
      if(item.versionNum != null && item.versionNum == 'A001') {
        return '高空车';
      }
      var machineLicenseId = item.machineLicenseId;
      if(machineLicenseId == null) {
        return null;
      }
      var title = '';

      /*截取整机编号字符串*/
      var substrNum = function (start, number) {
        return machineLicenseId.substr(start, number);
      };

      var machineLicenseType = substrNum(3, 1).toUpperCase();/*整机编号第4位*/
      if (machineLicenseType == 'L') {
        if (substrNum(7, 1) == '0') {
          title = '装载机' + substrNum(3, 4);
        } else {
          title = '装载机' + substrNum(3, 5);
        }
      } else if (machineLicenseType == 'G') {
        title = '平地机' + substrNum(3, 5);
      } else if (machineLicenseType == 'R') {
        title = '压路机' + substrNum(3, 5);
      } else if (machineLicenseType == 'E') {
        title = '挖掘机' + substrNum(3, 5);
      } else if (machineLicenseType == '0') {
        if (substrNum(7, 1).toUpperCase() == 'E') {
          title = '挖掘机' + substrNum(7, 1) + substrNum(4, 3);
        } else if (substrNum(7, 1).toUpperCase() == 'L') {
          title = '装载机' + substrNum(7, 1) + substrNum(4, 3);
        } else if (substrNum(7, 1).toUpperCase() == 'G') {
          title = '平地机' + substrNum(7, 1) + substrNum(4, 3);
        } else if (substrNum(7, 1).toUpperCase() == 'R') {
          title = '压路机' + substrNum(7, 1) + substrNum(4, 3);
        } else {
          title = '装载机';
        }
      } else if (!isNaN(machineLicenseType) && machineLicenseType != '0') {
        if (substrNum(7, 1).toUpperCase() == 'E') {
          title = '挖掘机' + substrNum(7, 1) + substrNum(3, 3);
        } else if (substrNum(7, 1).toUpperCase() == 'L') {
          title = '装载机' + substrNum(7, 1) + substrNum(3, 3);
        } else if (substrNum(7, 1).toUpperCase() == 'G') {
          title = '平地机' + substrNum(7, 1) + substrNum(3, 3);
        } else if (substrNum(7, 1).toUpperCase() == 'R') {
          title = '压路机' + substrNum(7, 1) + substrNum(3, 3);
        } else {
          title = '装载机';
        }
      }
      return title;
    };


//添加带文本的点标记覆盖物
    var addMarkerModel = function(mapObj,item, icon) {
      var mapObj = mapObj;
      //实例化信息窗体
      var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        offset: new AMap.Pixel(15, -43)//-113, -140

      });

      var marker = new AMap.Marker({
        map: mapObj,
        position: new AMap.LngLat(item.amaplongitudeNum, item.amaplatitudeNum), //基点位置
        icon:new AMap.Icon({
          image: icon,
          imageOffset: new AMap.Pixel(-15, -10)
        })//复杂图标
       // offset: new AMap.Pixel(-108, 124), //相对于基点的偏移位置
        // draggable: true,  //是否可拖动
        //  content: markerInfoLayer   //自定义点标记覆盖物内容
      });
      // marker.setMap(mapObj);  //在地图上添加点
      AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
        infoWindow.open(mapObj, marker.getPosition());

        var title = '<span style="font-size:11px;color:#F00;">数据更新时间:' + item.lastDataUploadTime + '</span>';
        var title = '';
        var contentInfo = "终端编号：" + item.deviceNum + "</br>当前位置：" + item.address + "<br/>数据更新时间：" + $filter('date')(item.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss') + "<br/>坐标:<br/>工作时间:"+item.totalDuration+"<br/>";

      //  var title = '<span style="font-size:11px;color:#F00;">数据更新时间:' + item.lastDataUploadTime + '</span>';
      //  var title = '';

        //title = mapDeviceType(item);
        if(item.versionNum == 'A001') {
          title = "高空车";
        } else {
          title = "矿机";
        }

        /*若整机编号为空，则显示终端编号*/
        if(title == null){
          title = item.deviceNum;
        }




       // var contentInfo = "终端编号：" + item.deviceNum +"<br/>工作时间:"+item.totalDuration+ "<br/>维度: "+item.amaplatitudeNum+"<br/> 经度: "+item.amaplongitudeNum+"<br/>当前位置：" + item.address + "<br/>更 新时间：" + $filter('date')(item.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss') + "<br/>";

        var contentInfo="";
        //contentInfo += languages.findKey('terminalNumber')+"：" + item.deviceNum +"<br/>";
        contentInfo += languages.findKey('workingHours')+": "+(item.totalDuration==null ?'':$filter('number')(item.totalDuration,2))+ "<br/>";

        contentInfo += languages.findKey('longitude')+": "+(item.amaplongitudeNum==null ?'':$filter('number')(item.amaplongitudeNum,2))+"<br/>";
        contentInfo += languages.findKey('latitude')+": "+(item.amaplatitudeNum==null ?'':$filter('number')(item.amaplatitudeNum,2))+"<br/>";

        contentInfo += languages.findKey('currentPosition')+":" +(item.address==null ?'':item.address) + "<br/>";
        contentInfo += languages.findKey('updateTime')+": " +(item.lastDataUploadTime==null ?'':$filter('date')(item.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss'))  + "<br/>";


        //contentInfo += "<a href='../../Equipment/EquipmentDetail/" + item.TerminalEquipmentId + "' class='btn btn-xs btn-primary'>详细信息</a>";
        //contentInfo += "<a href='javascript:void(0);' class='btn btn-xs btn-primary'  onclick=\"showFence('" + item.TNum + "');\">查看围栏</a>";
        //contentInfo += "<a href='javascript:void(0);' class='btn btn-xs btn-primary'  onclick=\"setFence('" + item.TNum + "'," + item.G_Lng + "," + item.G_Lat + ");\">设置围栏</a>";
        //contentInfo += "<a style='display:none;' href='javascript:void(0);' class='btn btn-xs btn-primary'  onclick=\"endEddit();\" id='saveFence'>保存设置</a>";
        var info = createInfoWindow(title, contentInfo,mapObj);

        //设置窗体内容
        infoWindow.setContent(info);
      });

      //构建自定义信息窗体
      function createInfoWindow(title, content) {
        var info = document.createElement("div");
        info.className = "info";
        //可以通过下面的方式修改自定义窗体的宽高
        info.style.width = "220px";

        // 定义顶部标题
        var top = document.createElement("div");
        var titleD = document.createElement("div");
        var closeX = document.createElement("img");
        top.className = "info-top";
        titleD.innerHTML = title;
        closeX.src = "http://webapi.amap.com/images/close2.gif";
        closeX.onclick = closeInfoWindow;


        top.appendChild(titleD);
        top.appendChild(closeX);
        info.appendChild(top);

        // 定义中部内容
        var middle = document.createElement("div");
        var titleA = document.createElement("a");
        var mcont = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        mcont.innerHTML = content;
        titleA.innerHTML="终端编号:"+item.deviceNum;
        titleA.onclick =  Viewdetails;

        middle.appendChild(titleA);
        middle.appendChild(mcont);
        info.appendChild(middle);

        // 定义底部内容
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        bottom.style.position = 'relative';
        bottom.style.top = '0px';
        bottom.style.margin = '0 auto';
        var sharp = document.createElement("img");
        sharp.src = "http://webapi.amap.com/images/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
      };

      function closeInfoWindow() {
        mapObj.clearInfoWindow();
      };

      function Viewdetails(id,size) {
        var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + item.id;
        var deviceinfoPromis = restCallService(singlUrl, "GET");
        deviceinfoPromis.then(function (data) {
            $rootScope.deviceinfoMonitor = data.content;
            var templateUrl, controller;
            if($rootScope.deviceinfoMonitor.versionNum == 'A001') {
              templateUrl = 'app/components/deviceMonitor/deviceAerialCurrentInfo.html';
              controller = 'deviceAerialCurrentInfoController as deviceAerialCurrentInfoController';
            } else {
              templateUrl = 'app/components/deviceMonitor/devicecurrentinfo.html';
              controller = 'DeviceCurrentInfoController as deviceCurrentInfoCtrl';
            }
            $rootScope.currentOpenModal = $uibModal.open({
              animation: true,
              backdrop: false,
              templateUrl: templateUrl,
              controller: controller,
              size: 'lg',
              resolve: { //用来向controller传数据
                deviceinfo: function () {
                  return $rootScope.deviceinfoMonitor;
                }
              }
            });

          }, function (reason) {
            Notification.error(languages.findKey('failedToGetDeviceInformation'));
          }
        )
      }

    };

    return {
      restCallService:restCallService,
      refreshUserAuthtoken:function(newpassword){
        $rootScope.userInfo.authtoken ="Basic "+ btoa($rootScope.userInfo.userdto.ssn+":"+newpassword);
        $window.sessionStorage["userInfo"] = JSON.stringify($rootScope.userInfo);
      },

      getPermission:function(){
      if($rootScope.userInfo){
        var rspdata= restCallService(PERMISSIONS_URL,"GET");
        return rspdata;
      }
      },

      //高德地图逆向地理编码(坐标->地址)
      getAddressFromXY: function(lnglatXY,callback){
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          var geocoder = new AMap.Geocoder();
          geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
              callback(result.regeocode.formattedAddress);
            }
            else{
              //如果请求失败则把地址设置为'--'
              callback('--');
            }
          });
        })
      },
      //查询设备数据并更新地图 mapid 是DOM中地图放置位置的id
        refreshMapWithDeviceInfo: function (mapId,deviceList,zoomsize,centeraddr) {
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          if (!AMap) {
            location.reload(false);
          }
          var amapRuler, amapScale, toolBar,overView;
          var localZoomSize = 4;  //默认缩放级别
          if (zoomsize){
            localZoomSize = zoomsize;
          }
          //var localCenterAddr = [106.13,38.44];//设置中心点大概在银川附近
          var localCenterAddr = [104.06,30.83];//设置中心点大概在重庆附近
          if (centeraddr){
            localCenterAddr = centeraddr;
          }
          var map = new AMap.Map(mapId, {
            resizeEnable: true,
            scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
            center: localCenterAddr,
            zooms: [3, 18]
          });
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

          //读取所有设备的gps信息，home map使用
          if ($rootScope.userInfo ) {
            if(deviceList == null){
              var rspdata = restCallService(HOME_GPSDATA_URL, "GET");
              rspdata.then(function (data) {
                var deviceGPSInfo = data.content;  //返回的数组列表
                for (var i = 0; i < deviceGPSInfo.length; i++) {
                  if (deviceGPSInfo[i].amaplatitudeNum != null) {
                    var latitude = deviceGPSInfo[i].amaplatitudeNum;     //纬度
                  }
                  if (deviceGPSInfo[i].amaplongitudeNum != null) {
                    var longitude = deviceGPSInfo[i].amaplongitudeNum;   //经度
                  }
                  if (latitude != null && longitude != null) {
                    // addMarkerModel(map,deviceGPSInfo[i],"http://webapi.amap.com/images/marker_sprite.png");
                    var marker="assets/images/orangeMarker.png";
                    if(deviceGPSInfo[i].accStatus=='01'){
                      marker="assets/images/greenMarker.png";
                    }
                    addMarkerModel(map,deviceGPSInfo[i],marker);
                  }
                }
              }, function (reason) {
                map.clearMap();
                Notification.error(languages.findKey('failedToGetDeviceInformation'));
              })
            }
            else{
              deviceList.forEach(function(deviceInfo){
                if ((deviceInfo.locateStatus === 'A' || deviceInfo.locateStatus === '1' || deviceInfo.locateStatus === '01') && deviceInfo.amaplongitudeNum != null && deviceInfo.amaplatitudeNum != null) {


                  // var marker="http://webapi.amap.com/images/marker_sprite.png";
                  var marker="assets/images/orangeMarker.png";
                  if(deviceInfo.accStatus=='01'){
                    marker="assets/images/greenMarker.png";
                  }


                  addMarkerModel(map,deviceInfo,marker);
                }
              })
            }
          }
        })
      },
      //查询设备数据更新到google地图
      refreshGoogleMapWithDeviceInfo:function () {
        //中心点和默认缩放比例
        var map = {
          center: {latitude: 32.115170, longitude:102.355140},
          zoom: 4,
          options: {scrollwheel: false, scaleControl: true},
          markers:[]
        };
        if ($rootScope.userInfo) {
          var rspdata = restCallService(HOME_GOOGLEMAPGPSDATA_URL, "QUERY");
          rspdata.then(function (deviceGPSInfoList) {
            deviceGPSInfoList.forEach(function (deviceGPSInfo, index, array) {
              if (deviceGPSInfo != null && deviceGPSInfo.amaplatitudeNum != null && deviceGPSInfo.amaplongitudeNum != null) {
                //map.center.latitude=deviceGPSInfo.amaplatitudeNum;
                //map.center.longitude=deviceGPSInfo.amaplongitudeNum;
                map.markers.push({
                  id: index,
                  latitude: deviceGPSInfo.amaplatitudeNum,
                  longitude: deviceGPSInfo.amaplongitudeNum,
                  show: false,
                  deviceNum: deviceGPSInfo.deviceNum,
                  lastDataUploadTime: deviceGPSInfo.lastDataUploadTime == null ? '' : $filter('date')(deviceGPSInfo.lastDataUploadTime, 'yyyy-MM-dd HH:mm:ss'),
                  //totalDuration: deviceGPSInfo.workDuration == null ? '' : $filter('number')(deviceGPSInfo.workDuration, 2),
                  address: deviceGPSInfo.address
                })
              }
            })
          }, function (reason) {
            Notification.error('获取设备信息失败');
          })
        }

        return map;
      },
      //登录认证接口--a
      authenticatea:function(credentials){

        var loginInfo={ssn:credentials.username,password:credentials.password};
        var rspPromise= $http.post(
          USER_LOGIN_URL,
           loginInfo
        );
        return rspPromise;
      },
      //登录认证接口--b
      authenticateb:function(credentials){

      var loginInfo={ssn:credentials.username,token:credentials.authtoken};
      var rspPromise= $http.post(
        USER_LOGINBYTOKEN_URL,
        loginInfo
      );
        return rspPromise;
      },
      //分页查询设备信息(device info)
      queryDeviceInfo:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      }, //分页查询设备信息(device info)
      queryDeviceMonitorInfo:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_MONITOR_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询设备数据信息(device data)
      queryDeviceData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询设备数据简化信息(device simple data)
      queryDeviceSimpleData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_SIMPLE_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询定位数据简化信息(device simple gps data)
      queryDeviceSimpleGPSData: function (page, size, sort, queryCondition) {
        var restCallURL = DEVCE_SIMPLE_GPS_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition) {
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL, "GET");
      },
      //分页查询设备报警数据信息(device warning data)
      queryDeviceWarningData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_WARNING_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_WARNING_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询设备锁车短信
      queryDeviceLockData:function(page,size,sort,queryCondition){
        var restCallURL = DEVCE_LOCK_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_LOCK_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询用户信息(user info)
      queryUserInfo:function(page,size,sort,queryCondition){
        var restCallURL = USER_PAGED_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_USER_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //分页查询用户提醒信息(notification info)
      queryNotification:function(page,size,sort,queryCondition){
        var restCallURL = NOTIFICATION_PAGED_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_NOTIFICATION_SORT_BY;
        restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition){
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL,"GET");
      },
      //查询用户提醒信息统计数据()
      queryNotificationStatistics:function(){
        var restCallURL = NOTIFICATION_STATISTICS_URL;
        return restCallService(restCallURL,"QUERY");
      },
      //修改数据通用接口
      restUpdateRequest:function(URL,params){
        return restCallService(URL,"UPDATE",params);
      },

      //添加数据通用接口
      restAddRequest:function(URL,params){
        return restCallService(URL,"ADD",params);
      },

      //根据车架号判断车型
      //00 - 无特定类型
      //01 - 小挖
      getDeviceType:function(machineId){

        if (machineId == null){
          return "00";
        }

        var modelName = machineId.substr(3,5);
        var smallExModel = $rootScope.SMALL_EXCAVATOR_MODEL;

        if (smallExModel.indexOf(modelName) != -1){
          return "01";
        }
        return null;
      },

      //TODO 先根据version_num来判断是否为矿车，装载机，小挖， 123为装载机，A1为小挖，30为矿车,40为中挖
      //00 - 无特定类型
      //01 - 小挖
      //02 - 矿车
      //03 - 中挖
      //04 - 平地机T3   设备类型为 7
      //05 - 巴黎(T3)   设备类型为 5
      getDeviceTypeForVersionNum:function(version_num,deviceType){
        if(version_num=='3'&& deviceType=='7'){
          return '04';
        }
        if(version_num=='3'&& deviceType=='5'){
          return '05';
        }
        if(version_num==null||version_num==''||version_num=='1'||version_num=='2'||version_num=='3'){
            return '00';
        }
        if(version_num=='A1'){
            return '01';
        }
        if(version_num=='30'){
          return '02';
        }
        if(version_num=='40'){
            return '03';
        }
      },
      //将hh.hh翻译成hh时mm分
      convertToMins: function(hours){
        var hoursArray;
        var hourMins;
        if(hours!=null){
          hoursArray=hours.toString().split(".");


        if (hoursArray[0] != null){
          hourMins = hoursArray[0] + languages.findKey('hour');
        }
        if (hoursArray[1] != null){
          var mins = "0." + hoursArray[1]
          hourMins = hourMins + " " + Math.round(mins * 60) + languages.findKey('mins');
        }
        return hourMins;
        }
      },

      getWarningMsg:function(deviceWarningData,deviceType){
        if(deviceType){
          var warningMsg = $rootScope.warningDataDtc[deviceWarningData.spn+deviceWarningData.fmi];
          if(warningMsg!=null||!angular.isUndefined(warningMsg)){
            var dtcKey="["+ deviceWarningData.spn + ":"+ deviceWarningData.fmi +":"+ deviceWarningData.cm + ":"+ deviceWarningData.oc +"]";
            return dtcKey+warningMsg
          }
        }
        return "[SPN:" + deviceWarningData.spn + "] [FMI:"+ deviceWarningData.fmi +"] [CM:"+ deviceWarningData.cm + "] [OC:"+ deviceWarningData.oc +"]";
      },
      handleRsp: function (action, rspData) {
        if (rspData.result != "Success") {
          //     TipService.setMessage(action, 'error');
          Notification.error(action + ' 操作失败');
        }
        else {
          //   TipService.setMessage('操作成功', 'success');
          Notification.success('操作成功');
        }
      },
      padLeft: function (pad, str, padLeft) {
        if (typeof str === 'undefined')
          return pad;
        if (padLeft) {
          return (pad + str).slice(-pad.length);
        } else {
          return (str + pad).substring(0, pad.length);
        }
      },
      getWarningInfo: function (errorCode) {
        var warningMsg = {
          description: '未找到',
          action: '未找到'
        };
        switch (errorCode) {
          //ECU传递数值导致接受到的warningCode 为数值，补充1 2 3与01 02 03对应
          case '1':
            warningMsg.description = "系统初始化错误";
            warningMsg.action = "停止所有动作";
            break;
          case '2':
            warningMsg.description = "系统通信错误";
            warningMsg.action = "停止所有动作";
            break;
          case '3':
            warningMsg.description = "无效选项设置错误";
            warningMsg.action = "停止所有动作";
            break;
          case '01':
            warningMsg.description = "系统初始化错误";
            warningMsg.action = "停止所有动作";
            break;
          case '02':
            warningMsg.description = "系统通信错误";
            warningMsg.action = "停止所有动作";
            break;
          case '03':
            warningMsg.description = "无效选项设置错误";
            warningMsg.action = "停止所有动作";
            break;
          case '12':
            warningMsg.description = "启动时底盘上升或下降按钮打开错误";
            warningMsg.action = "停止所有底盘控制";
            break;
          case '18':
            warningMsg.description = "坑洞保护错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '31':
            warningMsg.description = "压力传感器错误";
            warningMsg.action = "停止所有动作";
            break;
          case '32':
            warningMsg.description = "角度传感器错误";
            warningMsg.action = "停止所有动作";
            break;
          case '38':
            warningMsg.description = "标定过程不成功或标定数据存储错误";
            warningMsg.action = "重新标定";
            break;
          case '41':
            warningMsg.description = "锁车报警";
            warningMsg.action = "下次上电锁车";
            break;
          case '42':
            warningMsg.description = "启动时,平台向左转向按钮按下错误";
            warningMsg.action = "仅显示报警";
            break;
          case '43':
            warningMsg.description = "启动时,平台向右转向按钮按下错误";
            warningMsg.action = "仅显示报警";
            break;
          case '46':
            warningMsg.description = "启动时,平台手柄使能开关按钮按下错误";
            warningMsg.action = "停止平台控制";
            break;
          case '47':
            warningMsg.description = "启动时,平台手柄不在中位错误";
            warningMsg.action = "车速降到起升后的速度";
            break;
          case '52':
            warningMsg.description = "前进线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '53':
            warningMsg.description = "后退线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '54':
            warningMsg.description = "起升上升线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '55':
            warningMsg.description = "起升下降线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '56':
            warningMsg.description = "右转线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '57':
            warningMsg.description = "左转线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '58':
            warningMsg.description = "刹车线圈错误";
            warningMsg.action = "停止起升和行走";
            break;
          case '68':
            warningMsg.description = "低电压报警";
            warningMsg.action = "停止所有动作";
            break;
          case '80':
            warningMsg.description = "超过80%负载报警";
            warningMsg.action = "只是报警";
            break;
          case '90':
            warningMsg.description = "超过90%负载报警";
            warningMsg.action = "只是报警";
            break;
          case '99':
            warningMsg.description = "超过99%负载报警";
            warningMsg.action = "只是报警";
            break;
          case 'OL':
            warningMsg.description = "平台超载报警";
            warningMsg.action = "停止所有动作";
            break;
          case 'LL':
            warningMsg.description = "机器倾斜超过安全限定错误";
            warningMsg.action = "停止起升和行走";
            break;
        }
        return warningMsg;
      },
      lineToUpper:function test(str){
        var arr = str.split("-");//用split()函数来进行分割字符串arr里面包括【border，bottom，color】
        for(var i=1;i<arr.length;i++){//从数组的第二项开始循环，charAt(0)找到第一个字母。substring(1)截掉第一个字母。
          arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);//循环之后把得到的字符赋给arr。【border，Bottom， Color】
          alert(arr[i]);
        }
        return arr.join("");//用join方法来拼接，空拼接。就变成borderBottomColor
      },
      getConfigInfo:function (userInfo,requestURL,queryCondition,callback) {
        var search = $location.search();
        var page = search.page||0;
        var size = search.size||40;
        var sort = search.sort||'id,desc';
        var finalURL = requestURL + "?page=" + page  + '&size=' + size + '&sort=' + sort;
        if (queryCondition){
          finalURL =  finalURL + queryCondition;
        }
        var respData = restCallService(finalURL, 'GET');
        return respData;
      },
      addConfigInfo:function(userInfo,newConfigInfo,requestUrl,callback){
        var rspData = restCallService(requestUrl, "ADD", newConfigInfo);
        rspData.then(function(data){
          callback && callback(data);
        },function(reason){
          callback && callback(reason);
        });
      },
      //油缸压力转换
      convertTooilPressure:function(value){

        return 25*value/4095;
      },
      convertTobatteryPower:function( value){

        return 55*value/4095;
      },
      convertGSMSing: function (value) {
        var singValue = value / 31 * 100;
        return singValue.toFixed(2);
      }
    }
  }

})();
