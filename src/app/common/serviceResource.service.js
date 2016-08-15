/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('serviceResource', serviceResource);

  /** @ngInject */

  function serviceResource($rootScope,$resource,$http,$q,$window,$filter,permissions,Notification,languages,USER_LOGIN_URL,NOTIFICATION_STATISTICS_URL,
                           AMAP_URL,HOME_GPSDATA_URL,DEVCE_PAGED_QUERY,DEVCE_MONITOR_PAGED_QUERY,DEFAULT_SIZE_PER_PAGE,DEVCE_DATA_PAGED_QUERY,DEVCE_SIMPLE_DATA_PAGED_QUERY,
                           NOTIFICATION_PAGED_URL,USER_PAGED_URL,DEVCE_WARNING_DATA_PAGED_QUERY,DEFAULT_USER_SORT_BY,DEFAULT_NOTIFICATION_SORT_BY,
                           DEFAULT_DEVICE_SORT_BY,DEFAULT_DEVICE_DATA_SORT_BY,DEFAULT_DEVICE_WARNING_DATA_SORT_BY,AMAP_GEO_CODER_URL,PERMISSIONS_URL) {
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
        var title = item.deviceNum;



       // var contentInfo = "终端编号：" + item.deviceNum +"<br/>工作时间:"+item.totalDuration+ "<br/>维度: "+item.amaplatitudeNum+"<br/> 经度: "+item.amaplongitudeNum+"<br/>当前位置：" + item.address + "<br/>更 新时间：" + $filter('date')(item.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss') + "<br/>";

        var contentInfo="";
        contentInfo += languages.findKey('terminalNumber')+"：" + item.deviceNum +"<br/>";
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
        sharp.src = "http://webapi.amap.com/images/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
      };

      function closeInfoWindow() {
        mapObj.clearInfoWindow();
      };

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
          var localCenterAddr = [103.39,36.9];//设置中心点大概在兰州附近
          if (centeraddr){
            localCenterAddr = centeraddr;
          }
          var map = new AMap.Map(mapId, {
            resizeEnable: true,
            center: localCenterAddr,
            zooms: [localZoomSize, 18]
          });
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

          //读取所有设备的gps信息，home map使用
          if ($rootScope.userInfo ) {
            if(deviceList == null){
              var rspdata = restCallService(HOME_GPSDATA_URL, "QUERY");
              rspdata.then(function (data) {
                var deviceGPSInfo = data;  //返回的数组列表
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
                if (deviceInfo.locateStatus === 'A' && deviceInfo.amaplongitudeNum != null && deviceInfo.amaplatitudeNum != null) {


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
      //登录认证接口
      authenticate:function(credentials){

        var loginInfo={ssn:credentials.username,password:credentials.password};
        var rspPromise= $http.post(
          USER_LOGIN_URL,
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

      //TODO 先根据device_num来判断是否为矿车，装载机，小挖， 123为装载机，A1为小挖，30为矿车,40为中挖
      //00 - 无特定类型
      //01 - 小挖
      //02 - 矿车
      //03 - 中挖
      getDeviceTypeForVersionNum:function(device_num){
        if(device_num==null||device_num==''||device_num=='1'||device_num=='2'||device_num=='3'){
            return '00';
        }
        if(device_num=='A1'){
            return '01';
        }
        if(device_num=='30'){
            return '02';
        }
        if(device_num=='40'){
            return '03'
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

      //TODO
      getWarningMsg:function(deviceWarningData,deviceType){
        //00 - 无特定类型
        //01 - 小挖
        //如果需要别的设备的报警信息则deviceType可以判断
        if( deviceType=="01" || deviceType=="02"||deviceType=="03"||deviceType=="00"){
          var dtcKey="["+ deviceWarningData.spn + ":"+ deviceWarningData.fmi +":"+ deviceWarningData.cm + ":"+ deviceWarningData.oc +"]";
          return dtcKey+$rootScope.warningDataDtc[deviceWarningData.spn+deviceWarningData.fmi];
        }
        else{
          return "[SPN:" + deviceWarningData.spn + "] [FMI:"+ deviceWarningData.fmi +"] [CM:"+ deviceWarningData.cm + "] [OC:"+ deviceWarningData.oc +"]";
        }


      }

    }
  }

})();
