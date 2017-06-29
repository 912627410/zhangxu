/**
 * Created by xiaopeng on 17-5-23.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fleetLineMonitorController', fleetLineMonitorController);

  /** @ngInject */
  function fleetLineMonitorController($rootScope,$scope,$filter,WORK_LINE_URL,Map,fleetTreeFactory, WEBSOCKET_URL,Notification,serviceResource,languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    var fleetMonitorUrl;
    vm.fleet = $rootScope.fleetChart[0];

    vm.lineColor = [];
    for(var i = 0;i < 21;i++) {
      if(i%10 == 0 ) {
        vm.lineColor.push("#ff0000");
      } else {
        vm.lineColor.push("#999");
      }
    }

    vm.openFleetTree = function () {
      fleetTreeFactory.treeShow(function (selectedItem) {
        vm.fleet =selectedItem;
        if(fleetMonitorUrl){fleetMonitorUrl.close();}
        vm.initLineQuery(vm.fleet);
      });
    }

    vm.initLineQuery = function (fleet) {
      var restCallURL = WORK_LINE_URL;

      restCallURL += "?page=0&size=1000&sort=id";
      //只显示启用的路线
      restCallURL += "&search_EQ_status=" + 1;
      restCallURL += "&search_EQ_ifMonitor=" + 1;

      if(fleet!=null){
        restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      }

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.workLineList = data.content;
          vm.refreshChart("fleetChart", vm.workLineList );

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };

    vm.refreshChart = function (chartId, lineList) {

      vm.fleetChart = echarts.init(document.getElementById(chartId));

       vm.option = {
        tooltip: {
          position: 'top'
        },
        title: [],
        singleAxis: [],
        series: []
      };

      vm.mapList = [];

      if(lineList.length > 0 ){
        echarts.util.each(lineList, function (line, idx) {
          //cebianlan
          vm.option.title.push({
            textBaseline: 'middle',
            top: (idx + 0.5) * 100 / lineList.length + '%',
            text: line.beginPoint.name,
            left: '2%'
          },{
            textBaseline: 'middle',
            left: '48%',
            top: (idx + 0.5) * 100 / lineList.length + '%',
            text: line.endPoint.name
          },{
            textBaseline: 'middle',
            right: '0',
            top: (idx + 0.5) * 100 / lineList.length + '%',
            text: line.beginPoint.name
          });
          //
          vm.option.singleAxis.push({
            left: 100,
            type: 'value',
            boundaryGap: false,
            splitLine:{
              show:true,
              lineStyle:{
                width: 2,
                color: vm.lineColor
              }
            },
            min: -1,
            max: 1,
            interval: 0.1,
            top: (idx * 100 / lineList.length + 5) + '%',
            height: (100 / lineList.length - 10) + '%'

          });
          vm.option.series.push({
            singleAxisIndex: idx,
            coordinateSystem: 'singleAxis',
            type: 'scatter',
            label: {
              normal: {
                show: true,
                position: 'top',
                formatter: '{b}'
              }
            },
            tooltip : {
              formatter:  function (params) {
                return params.name + '<br>' + params.data.content;
              }
            },
            data: [],
            symbolSize: function (dataItem) {
              return dataItem[1] * 4;
            }
          });

          vm.mapList.push(angular.copy(Map));

        });

      } else {
        Notification.warning("请先维护车队作业路线!");

      }

      vm.fleetChart.setOption(vm.option);

      vm.openMonitor(lineList);

    }



    // 使用刚指定的配置项和数据显示图表。


    // open
    vm.openMonitor = function (lineList) {

      if(lineList ==null || lineList.length < 1){
        return ;
      }

      // websocket monitor
      fleetMonitorUrl = new WebSocket(WEBSOCKET_URL + "webSocketServer/fleetRealTimeMonitor?token=" + vm.operatorInfo.authtoken);

      fleetMonitorUrl.onerror = function (evt) {
        Notification.error("WebSocket Error!");
      };


      fleetMonitorUrl.onmessage = function (evt) {
        var monitorVo = JSON.parse(evt.data);
        if(monitorVo.fleet != vm.fleet.id ){
          return;
        }

        if(monitorVo.pointType ==2){
          for(var i =0 ;i < lineList.length; i++){
            //在料点装料
            if(monitorVo.inPoint == lineList[i].beginPoint.id ){
              var map = angular.copy(Map);
              map = vm.mapList[i];

              var value = {
                symbol: 'image://assets/images/car_right5_2.png',
                symbolOffset: [0, 600/lineList.length -60 + '%'],
                name: monitorVo.deviceNum,
                value: [-1, 6]
              }

              map.put(monitorVo.deviceNum, value);
              removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
            }

            //在料点卸料
            if(monitorVo.inPoint == lineList[i].endPoint.id){
              var map = angular.copy(Map);
              map = vm.mapList[i];
              var value = {
                symbol: 'image://assets/images/car_right5_2.png',
                symbolOffset: [0,600/lineList.length -60 + '%'],
                name: monitorVo.deviceNum,
                value: [0, 6]
              }
              map.put(monitorVo.deviceNum, value);
              removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
            }

          }
        }

        //从料点出来  必须有里程
        if(monitorVo.pointType==1 && monitorVo.mileage !=null ){
          for(var i =0 ;i < lineList.length; i++){
            if(monitorVo.outPoint != null){
              if(monitorVo.outPoint == lineList[i].beginPoint.id ){
                var map = angular.copy(Map);
                map = vm.mapList[i];
                var percent = monitorVo.mileage/10/lineList[i].distance > 1 ? 1 : monitorVo.mileage/10/lineList[i].distance;

                console.log(monitorVo.deviceNum + "out from " + lineList[i].beginPoint.name  + percent);

                var value = {
                  symbol: 'image://assets/images/car_right5_2.png',
                  symbolOffset: [0,600/lineList.length -60 + '%'],
                  name: monitorVo.deviceNum,
                  value: [percent -1, 12],
                  content: "离开" + lineList[i].beginPoint.name + monitorVo.mileage/10 + "km"
                }

                map.put(monitorVo.deviceNum, value);
                removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
              }

              // form out
              if(monitorVo.outPoint == lineList[i].endPoint.id){
                var map = angular.copy(Map);
                map = vm.mapList[i];
                var percent = monitorVo.mileage/10/lineList[i].distance >= 1 ? 1 : monitorVo.mileage/10/lineList[i].distance;

                console.log(monitorVo.deviceNum + "out from " + lineList[i].endPoint.name  + percent)

                var value = {
                  symbol: 'image://assets/images/car_right5_1.png',
                  symbolOffset: [0,600/lineList.length -60 + '%'],
                  name: monitorVo.deviceNum,
                  value: [percent, 12],
                  content: "离开" + lineList[i].endPoint.name + monitorVo.mileage/10 + "km"

                }
                map.put(monitorVo.deviceNum, value);
                removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
              }
            }
          }

          for(var i=0; i < vm.mapList.length; i++){
            vm.option.series[i].data = vm.mapList[i].values();

          }

          vm.fleetChart.setOption(vm.option);

        }

      };

    }


    var removeFromOtherMap = function (list, inMapIndex, key) {

      for(var i =0;i < list.length; i++){
        if(inMapIndex!= i){
          var map = list[i];
          map.remove(key)
        }
      }

    };


    $scope.$on("$destroy",function () {
      if(fleetMonitorUrl){fleetMonitorUrl.close();}
    });

    vm.initLineQuery(vm.fleet);

  }
})();
