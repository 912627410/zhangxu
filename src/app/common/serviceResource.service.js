/**
 * Created by shuangshan on 16/1/2.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('serviceResource', serviceResource);

  /** @ngInject */

  function serviceResource($rootScope, $resource, $http, $q, $uibModal, $window, $filter, Notification, languages, USER_LOGIN_URL, NOTIFICATION_STATISTICS_URL, DEVCE_MONITOR_SINGL_QUERY,
                           HOME_GPSDATA_URL, DEVCE_PAGED_QUERY, DEVCE_MONITOR_PAGED_QUERY, DEFAULT_SIZE_PER_PAGE, DEVCE_DATA_PAGED_QUERY, DEVCE_SIMPLE_DATA_PAGED_QUERY,
                           NOTIFICATION_PAGED_URL, USER_PAGED_URL, DEVCE_WARNING_DATA_PAGED_QUERY, DEFAULT_USER_SORT_BY, DEFAULT_NOTIFICATION_SORT_BY, LX_DEVCE_MONITOR_SINGL_QUERY,
                           DEFAULT_DEVICE_SORT_BY, DEFAULT_DEVICE_DATA_SORT_BY, DEFAULT_DEVICE_DATA_SORT_BY_ASC, DEFAULT_DEVICE_WARNING_DATA_SORT_BY,
                           DEFAULT_DEVICE_LOCK_DATA_SORT_BY, DEVCE_LOCK_DATA_PAGED_QUERY, AMAP_GEO_CODER_URL, PERMISSIONS_URL, USER_LOGINBYTOKEN_URL) {
    var restCallService = function (URL, action, params) {
      var restCall = $resource(URL);

      var defer = $q.defer();
      var succCallback = function (data) {
        defer.resolve(data);
      };
      var failCallback = function (data) {
        defer.reject(data);
      };
      if (action == "GET") {
        restCall.get(succCallback, failCallback);
      }
      //如果返回json是array的话需要用query，否则用get
      if (action == "QUERY") {
        restCall.query(succCallback, failCallback);
      }
      //POST
      if (action == "ADD") {
        restCall.save(params, succCallback, failCallback);
      }
      //PUT
      if (action == "UPDATE") {
        var restUpdateCall = $resource(URL, {}, {'update': {method: 'PUT'}});
        restUpdateCall.update(params, succCallback, failCallback);

      }
      return defer.promise
    };

    /**
     * 判断机器设备类型
     * @param id
     * @returns {*}
     */
    var mapDeviceType = function (id) {
      if (id == null) {
        return null;
      }
      var machineLicenseId = id;
      var title = '';

      /*截取整机编号字符串*/
      var substrNum = function (start, number) {
        return machineLicenseId.substr(start, number);
      };

      var machineLicenseType = substrNum(3, 1).toUpperCase();
      /*整机编号第4位*/
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
    var addMarkerModel = function (mapObj, item, icon) {
      var mapObj = mapObj;
      //实例化信息窗体
      var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        offset: new AMap.Pixel(15, -43)//-113, -140

      });
      var marker = new AMap.Marker({
        map: mapObj,
        position: new AMap.LngLat(item.amaplongitudeNum, item.amaplatitudeNum), //基点位置
        icon: new AMap.Icon({
          image: icon,
          imageOffset: new AMap.Pixel(-15, -10)
        })
      });
      AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
        infoWindow.open(mapObj, marker.getPosition());
        var title = mapDeviceType(item.machineLicenseId);
        /*若整机编号为空，则显示终端编号*/
        if (title == null) {
          title = item.deviceNum;
        }
        var contentInfo = "";
        contentInfo += languages.findKey('workingHours') + ": " + (item.totalDuration == null ? '' : $filter('number')(item.totalDuration, 2)) + "<br/>";
        contentInfo += languages.findKey('longitude') + ": " + (item.amaplongitudeNum == null ? '' : $filter('number')(item.amaplongitudeNum, 2)) + "<br/>";
        contentInfo += languages.findKey('latitude') + ": " + (item.amaplatitudeNum == null ? '' : $filter('number')(item.amaplatitudeNum, 2)) + "<br/>";
        contentInfo += languages.findKey('currentPosition') + ":" + (item.address == null ? '' : item.address) + "<br/>";
        contentInfo += languages.findKey('updateTime') + ": " + (item.lastDataUploadTime == null ? '' : $filter('date')(item.lastDataUploadTime, 'yyyy-MM-dd HH:mm:ss')) + "<br/>";
        var info = createInfoWindow(title, contentInfo, mapObj);
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
        titleA.innerHTML = "终端编号:" + item.deviceNum;
        titleA.onclick = Viewdetails;

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

      /**
       * 北谷设备的详情展示
       *
       * @param id
       */
      function nvrDevinfoShow() {
        var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + item.id;
        var deviceinfoPromis = restCallService(singlUrl, "GET");
        deviceinfoPromis.then(function (data) {
            $rootScope.deviceinfoMonitor = data.content;
            $rootScope.currentOpenModal = $uibModal.open({
              animation: true,
              backdrop: false,
              templateUrl: 'app/components/deviceMonitor/devicecurrentinfo.html',
              controller: 'DeviceCurrentInfoController as deviceCurrentInfoCtrl',
              size: 'super-lgs',
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

      /**
       * 南京理学deviceinfo展示
       *
       * @param id
       */
      function lxDeviceInfShow() {
        var singleUrl = LX_DEVCE_MONITOR_SINGL_QUERY + "?id=" + item.id;
        var deviceInfoPromise = restCallService(singleUrl, "GET");
        deviceInfoPromise.then(function (data) {
            $rootScope.currentOpenModal = $uibModal.open({
              animation: true,
              backdrop: false,
              templateUrl: 'app/components/deviceMonitor/lxDeviceCurrentInfo.html',
              controller: 'lxDeviceCurrentInfoController as vm',
              size: 'super-lgs',
              resolve: { //用来向controller传数据
                lxDeviceInfo: function () {
                  return data.content;
                }
              }
            });

          }, function (reason) {
            Notification.error(languages.findKey('failedToGetDeviceInformation'));
          }
        )
      }

      function Viewdetails(id, size) {
        if (item.versionNum != null && item.versionNum != undefined && item.versionNum === 'lx01') {
          lxDeviceInfShow();
          return;
        }
        nvrDevinfoShow();
      }

    };

    return {
      restCallService: restCallService,
      getPermission: function () {
        if ($rootScope.userInfo) {
          var rspdata = restCallService(PERMISSIONS_URL, "GET");
          return rspdata;
        }
      },
      //查询设备数据并更新地图 mapid 是DOM中地图放置位置的id
      refreshMapWithDeviceInfo: function (mapId, deviceList, zoomsize, centeraddr) {
        var maps;
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          //初始化地图对象
          if (!AMap) {
            location.reload(false);
          }
          var amapScale, toolBar, overView;
          var localZoomSize = 4;  //默认缩放级别
          if (zoomsize) {
            localZoomSize = zoomsize;
          }
          var localCenterAddr = [103.39, 36.9];//设置中心点大概在兰州附近
          if (centeraddr) {
            localCenterAddr = centeraddr;
          }
          var map = new AMap.Map(mapId, {
            resizeEnable: true,
            center: localCenterAddr,
            scrollWheel: false,
            zooms: [3, 18]
          });
          maps = map;
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
          if (!$rootScope.userInfo) {
            return;
          }

          if (deviceList == null) {
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
                  var marker = "assets/images/orangeMarker.png";
                  if (deviceGPSInfo[i].accStatus == '01') {
                    marker = "assets/images/greenMarker.png";
                  }
                  addMarkerModel(map, deviceGPSInfo[i], marker);
                }
              }
            }, function (reason) {
              map.clearMap();
              Notification.error(languages.findKey('failedToGetDeviceInformation'));
            })
            return;
          }

          deviceList.forEach(function (deviceInfo) {
            if (deviceInfo.locateStatus === 'A' && deviceInfo.amaplongitudeNum != null && deviceInfo.amaplatitudeNum != null) {
              var marker = "assets/images/orangeMarker.png";
              if (deviceInfo.accStatus == '01') {
                marker = "assets/images/greenMarker.png";
              }
              addMarkerModel(map, deviceInfo, marker);
            }
          })

        })
        return maps;
      },
      //登录认证接口--a
      authenticatea: function (credentials) {
        var loginInfo = {ssn: credentials.username, password: credentials.password};
        var rspPromise = $http.post(
          USER_LOGIN_URL,
          loginInfo
        );
        return rspPromise;
      },
      //登录认证接口--b
      authenticateb: function (credentials) {
        var loginInfo = {ssn: credentials.username, token: credentials.authtoken};
        var rspPromise = $http.post(
          USER_LOGINBYTOKEN_URL,
          loginInfo
        );
        return rspPromise;
      },
      //分页查询设备信息(device info)
      queryDeviceInfo: function (page, size, sort, queryCondition) {
        var restCallURL = DEVCE_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_SORT_BY;
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition) {
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL, "GET");
      },
      //分页查询设备数据信息(device data)
      queryDeviceData: function (page, size, sort, queryCondition) {
        var restCallURL = DEVCE_DATA_PAGED_QUERY;
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
      //分页查询设备数据简化信息(device simple data)
      queryDeviceSimpleData: function (page, size, sort, queryCondition) {
        var restCallURL = DEVCE_SIMPLE_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_DATA_SORT_BY_ASC;
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition) {
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL, "GET");
      },
      //分页查询设备报警数据信息(device warning data)
      queryDeviceWarningData: function (page, size, sort, queryCondition) {
        var restCallURL = DEVCE_WARNING_DATA_PAGED_QUERY;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_DEVICE_WARNING_DATA_SORT_BY;
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition) {
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL, "GET");
      },
      //分页查询用户提醒信息(notification info)
      queryNotification: function (page, size, sort, queryCondition) {
        var restCallURL = NOTIFICATION_PAGED_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || DEFAULT_NOTIFICATION_SORT_BY;
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryCondition) {
          restCallURL += "&";
          restCallURL += queryCondition;
        }
        return restCallService(restCallURL, "GET");
      },
      //查询用户提醒信息统计数据()
      queryNotificationStatistics: function () {
        var restCallURL = NOTIFICATION_STATISTICS_URL;
        return restCallService(restCallURL, "QUERY");
      },
      //修改数据通用接口
      restUpdateRequest: function (URL, params) {
        return restCallService(URL, "UPDATE", params);
      },

      //添加数据通用接口
      restAddRequest: function (URL, params) {
        return restCallService(URL, "ADD", params);
      },

      /**
       *根据车架号判断车型
       *  00 - 无特定类型
       *  01 - 小挖
       */
      getDeviceType: function (machineId) {
        if (machineId == null) {
          return "00";
        }
        var modelName = machineId.substr(3, 5);
        var smallExModel = $rootScope.SMALL_EXCAVATOR_MODEL;
        if (smallExModel.indexOf(modelName) != -1) {
          return "01";
        }
        return null;
      },

      /**
       * 00 - 装载机
       * 01 - 小挖
       * 02 - 矿车
       * 03 - 中挖(中挖无LED灯)
       * 04 - 巴黎(T3,特殊)
       */
      getDeviceTypeForVersionNum: function (version_num, deviceType) {
        //巴黎(T3,特殊*)
        if (version_num == '3' && deviceType == '5') {
          return '04';
        }
        //装载机
        if (version_num == null || version_num == '' || version_num == '1' || version_num == '2' || version_num == '3' || version_num == '2010' || version_num == '2040') {
          return '00';
        }
        //小挖
        if (version_num == 'A1' || version_num == '2030') {
          return '01';
        }
        //矿车
        if (version_num == '30') {
          return '02';
        }
        //中挖无LED灯
        if (version_num == '40') {
          return '03';
        }
      },
      /**
       * 中央报警灯,只考虑设备类型为0x03,0x04,0x05
       * @param deviceinfo deviceinfo
       */
      getCenterCodeStatus: function (deviceinfo) {
        /*
         中央报警灯
          1.电锁开,发动机转速>1000,驻车制动指示灯常亮,中央报警灯亮
          2.转速<400
              机油压力低,
              制动压力低,
              变速油压力低,
              冷却液温度高,
              充电指示报警,
              油水分离报警,
              燃油粗滤报警,
              燃油油位低报警,
              发动机故障报警,
              空滤阻塞报警,
              传动油粗滤报警,
              冷却液位低,
              后罩开启
              液压油温高
        */
        //中央报警
        var centerCode = '0';
        if (!!deviceinfo.ledStatus && !!deviceinfo.deviceType && (deviceinfo.deviceType === '3' || deviceinfo.deviceType === '4' || deviceinfo.deviceType === '5')) {
          //电锁
          var accStatus = deviceinfo.accStatus;
          //转速
          var engineRotate = deviceinfo.enginRotate;
          //驻车制动指示灯
          var stopParkingBrake = deviceinfo.ledStatus.substring(6, 7);
          if (accStatus === '01' && engineRotate > 1000 && stopParkingBrake === '1') {
            centerCode = '1';
            return centerCode;
          }

          //机油压力低指示灯
          var engineOilPressure = deviceinfo.ledStatus.substring(28, 29);
          //制动压力低指示灯
          var parkingBrake = deviceinfo.ledStatus.substring(4, 5);
          //变速油压力低
          var lowPressureOilPressure = deviceinfo.ledStatus.substring(24, 25);
          //冷却液温度高
          var HighTemperatureCoolant = deviceinfo.ledStatus.substring(27, 28);
          //充电
          var charge = deviceinfo.ledStatus.substring(1, 2);
          //油水分离报警
          var oilWaterSeparationAlarm = deviceinfo.ledStatus.substring(12, 13);
          //燃油粗滤报警
          var fuelCrudeFilterAlarm = deviceinfo.ledStatus.substring(13, 14);
          //燃油油位低报警
          var lowFuelOilLevelAlarm = deviceinfo.ledStatus.substring(5, 6);
          //发动机故障报警
          var engineFailure1 = deviceinfo.ledStatus.substring(25, 26);
          var engineFailure2 = deviceinfo.ledStatus.substring(26, 27);
          //空滤阻塞报警
          var airFiltrationObstruction = deviceinfo.ledStatus.substring(22, 23);
          //传动油粗滤报警
          var crudeOilFilter = deviceinfo.ledStatus.substring(21, 22);
          //冷却液位低
          var lowCoolingLevel = deviceinfo.ledStatus.substring(16, 17);
          //后罩开启
          var rearHoodOpening = deviceinfo.ledStatus.substring(20, 21);
          //液压油温高
          var highTemperatureHydraulicOil = deviceinfo.ledStatus.substring(14, 15);

          if (engineRotate < 400) {
            if (engineOilPressure === '1' || parkingBrake === '1' || lowPressureOilPressure === '1' || HighTemperatureCoolant === '1' || charge === '1' ||
              oilWaterSeparationAlarm === '1' || fuelCrudeFilterAlarm === '1' || lowFuelOilLevelAlarm === '1' || engineFailure1 === '1' || engineFailure2 === '1' ||
              airFiltrationObstruction === '1' || crudeOilFilter === '1' || lowCoolingLevel === '1' || rearHoodOpening === '1' || highTemperatureHydraulicOil === '1') {
              centerCode = '1';
              return centerCode;
            }
          }
        }
        return centerCode;
      },

      /**
       * 将hh.hh翻译成hh时mm分
       */
      convertToMins: function (hours) {
        var hoursArray;
        var hourMins;
        if (hours != null) {
          hoursArray = hours.toString().split(".");
          if (hoursArray[0] != null) {
            hourMins = hoursArray[0] + languages.findKey('hour');
          }
          if (hoursArray[1] != null) {
            var mins = "0." + hoursArray[1]
            hourMins = hourMins + " " + Math.round(mins * 60) + languages.findKey('mins');
          }
          return hourMins;
        }
      },

      getWarningMsg: function (deviceWarningData, deviceType) {
        if (deviceType) {
          var warningMsg = $rootScope.warningDataDtc[deviceWarningData.spn + deviceWarningData.fmi];
          if (warningMsg != null || !angular.isUndefined(warningMsg)) {
            var dtcKey = "[" + deviceWarningData.spn + ":" + deviceWarningData.fmi + ":" + deviceWarningData.cm + ":" + deviceWarningData.oc + "]";
            return dtcKey + warningMsg
          }
        }
        return "[SPN:" + deviceWarningData.spn + "] [FMI:" + deviceWarningData.fmi + "] [CM:" + deviceWarningData.cm + "] [OC:" + deviceWarningData.oc + "]";
      }
    }
  }
})();
