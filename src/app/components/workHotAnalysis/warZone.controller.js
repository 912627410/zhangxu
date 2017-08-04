/**
 * Created by zhenyu on 17-7-6.
 */

(function(){
  'use strict';

  angular.module('GPSCloud')
    .controller('warZoneController',warZoneController);

  function warZoneController($scope,WAR_ZONE_QUERY,$http,timeList){

    var mapColor = ['rgba(42, 93, 123, 1)','rgba(42, 93, 123,0.84)','rgba(42, 93, 123, 0.68)','rgba(42, 93, 123, 0.52)','rgba(42, 93, 123, 0.36)','rgba(42, 93, 123, 0.2)'],
      mapChartList = document.getElementsByClassName('mapchart'),
      barChartList = document.getElementsByClassName('barchart'),
      mapChart1 = echarts.init(mapChartList[0]),
      mapChart2 = echarts.init(mapChartList[1]),
      barChart1 = echarts.init(barChartList[0]),
      barChart2 = echarts.init(barChartList[1]),
      mapChartOption,
      barChartOption;

    $scope.cycle_type = ['按月查询','按季度查询'];
    $scope.statistical_type = ['开工热度','销售热度'];
    $scope.product_type = ['挖掘机','装载机','重机'];
    $scope.cycle_value = timeList.monthList(2017,1);

    //default
    $scope.query_cycle_type = '按月查询';
    $scope.query_cycle_value = '201706';
    $scope.query_hour = 2;
    $scope.query_statistical_type1 = '开工热度';
    $scope.query_statistical_type2 = '销售热度';
    $scope.query_product_type1 = '挖掘机';
    $scope.query_product_type2 = '挖掘机';


    $http.get('assets/json/warzone.json').success(function(data){
      echarts.registerMap('warZone', data);
      getMap1_Data('1','1','201706','2','1');
      getMap2_Data('1','1','201706','2','2');
    });

    function getMap1_Data(produceType,cycleType,cycleValue,hourScope,statisticalType) {
      $http({
        method: 'GET',
        url: WAR_ZONE_QUERY + 'all?produceType=' + produceType + '&cycleType=' + cycleType + '&cycleValue=' + cycleValue + '&hourScope=' + hourScope +'&statisticalType=' + statisticalType
      }).success(function(data,header,config,status){
        if(statisticalType == 1){
          data.sort(compare('workRate'));
        }else {
          data.sort(compare('salesRate'));
        }
        mapChartOption = {
          tooltip: {
            trigger: 'item',
            formatter: function(params){
              var tooltip;
              if(data[1].salesRate == undefined){
                tooltip = params.data.name + '</br>' + '开工率：' + data[params.dataIndex].workRate + '%' + '</br>'+ '车辆数量：' + data[params.dataIndex].machineCount + '台/天';
              }else{
                tooltip = params.data.name + '</br>' + '销售数：' + data[params.dataIndex].salesRate + '台';
              }
              return tooltip;
            }
          },
          visualMap: {
            type: 'piecewise',
            hoverLink: false,
            orient: 'horizontal',
            top: 0,
            left: 'center',
            pieces: [{
              label: data[0].warZone,
              value: 0,
              color: mapColor[0]
            },{
              label: data[1].warZone,
              value: 1,
              color: mapColor[1]
            },{
              label: data[2].warZone,
              value: 2,
              color: mapColor[2]
            },{
              label: data[3].warZone,
              value: 3,
              color: mapColor[3]
            },{
              label: data[4].warZone,
              value: 4,
              color: mapColor[4]
            },{
              label: data[5].warZone,
              value: 5,
              color: mapColor[5]
            }]
          },
          series: [{
            name: '战区分布',
            type: 'map',
            mapType: 'warZone',
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            data: [{
              name: data[0].warZone,
              value: 0,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[0]
                }
              }
            }, {
              name: data[1].warZone,
              value: 1,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[1]
                }
              }
            }, {
              name: data[2].warZone,
              value: 2,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[2]
                }
              }
            }, {
              name: data[3].warZone,
              value: 3,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[3]
                }
              }
            }, {
              name: data[4].warZone,
              value: 4,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[4]
                }
              }
            }, {
              name: data[5].warZone,
              value: 5,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[5]
                }
              }
            }]
          }]
        };
        mapChart1.setOption(mapChartOption);
      }).error(function(){
        console.log('HTTP ERROR')
      })
    }

    function getMap2_Data(produceType,cycleType,cycleValue,hourScope,statisticalType) {
      $http({
        method: 'GET',
        url: WAR_ZONE_QUERY + 'all?produceType=' + produceType + '&cycleType=' + cycleType + '&cycleValue=' + cycleValue + '&hourScope=' + hourScope +'&statisticalType=' + statisticalType
      }).success(function(data,header,config,status){
        if(statisticalType == 1){
          data.sort(compare('workRate'));
        }else {
          data.sort(compare('salesRate'));
        }
        mapChartOption = {
          tooltip: {
            trigger: 'item',
            formatter: function(params){
              var tooltip;
              if(data[1].salesRate == undefined){
                tooltip = params.data.name + '</br>' + '开工率：' + data[params.dataIndex].workRate + '%' + '</br>'+ '车辆数量：' + data[params.dataIndex].machineCount + ' 台/天';
              }else{
                tooltip = params.data.name + '</br>' + '销售数：' + data[params.dataIndex].salesRate + ' 台';
              }
              return tooltip;
            }
          },
          visualMap: {
            type: 'piecewise',
            hoverLink: false,
            orient: 'horizontal',
            top: 0,
            left: 'center',
            pieces: [{
              label: data[0].warZone,
              value: 0,
              color: mapColor[0]
            },{
              label: data[1].warZone,
              value: 1,
              color: mapColor[1]
            },{
              label: data[2].warZone,
              value: 2,
              color: mapColor[2]
            },{
              label: data[3].warZone,
              value: 3,
              color: mapColor[3]
            },{
              label: data[4].warZone,
              value: 4,
              color: mapColor[4]
            },{
              label: data[5].warZone,
              value: 5,
              color: mapColor[5]
            }]
          },
          series: [{
            name: '战区分布',
            type: 'map',
            mapType: 'warZone',
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            data: [{
              name: data[0].warZone,
              value: 0,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[0]
                }
              }
            }, {
              name: data[1].warZone,
              value: 1,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[1]
                }
              }
            }, {
              name: data[2].warZone,
              value: 2,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[2]
                }
              }
            }, {
              name: data[3].warZone,
              value: 3,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[3]
                }
              }
            }, {
              name: data[4].warZone,
              value: 4,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[4]
                }
              }
            }, {
              name: data[5].warZone,
              value: 5,
              itemStyle: {
                emphasis:{
                  areaColor: mapColor[5]
                }
              }
            }]
          }]
        };
        mapChart2.setOption(mapChartOption);
      }).error(function(){
        console.log('HTTP ERROR')
      })
    }

    function getBar1_Data(produceType, hourScope, statisticalType){
      $http({
        method: 'GET',
        url: WAR_ZONE_QUERY + 'fourQuarter?produceType=' + produceType + '&hourScope=' + hourScope +'&statisticalType=' + statisticalType
      }).success(function(data,header,config,status){

        var zoneList = getZoneList(),
          quarterList = getQuarterList(),
          valueList = getValueList();

        function getZoneList(){
          var temp = [];
          for(var i = 0,length = data.length;i<length;i++){
            temp[i] = data[i].warZone;
          }
          return temp
        }

        function getQuarterList() {
          var temp = [];
          for(var i = 0,length = 4;i<length;i++){
            temp[i] = data[0].quarterData[i].quarter;
          }
          return temp
        }

        function getValueList() {
          var temp = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
          for(var i = 0;i<6;i++){
            for(var j = 0;j<4;j++){
              temp[i][j] = data[i].quarterData[j].rate;
            }
          }
          return temp
        }

        barChartOption = {
          tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            data: zoneList
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis : [
            {
              type : 'category',
              data : quarterList
            }
          ],
          yAxis : [
            {
              type : 'value',
              name: '活跃度(%)'
            }
          ],
          series : [
            {
              name:zoneList[0],
              type:'bar',
              data:valueList[0]
            },
            {
              name:zoneList[1],
              type:'bar',
              data:valueList[1]
            },
            {
              name:zoneList[2],
              type:'bar',
              data:valueList[2]
            },
            {
              name:zoneList[3],
              type:'bar',
              data:valueList[3]
            },
            {
              name:zoneList[4],
              type:'bar',
              data:valueList[4]
            },
            {
              name:zoneList[5],
              type:'bar',
              data:valueList[5]
            }
          ]
        };
        barChart1.setOption(barChartOption);
      })
    }

    function getBar2_Data(produceType, hourScope, statisticalType){
      $http({
        method: 'GET',
        url: WAR_ZONE_QUERY + 'fourQuarter?produceType='+ produceType + '&hourScope=' + hourScope +'&statisticalType=' + statisticalType
      }).success(function(data,header,config,status){

        var zoneList = getZoneList(),
          quarterList = getQuarterList(),
          valueList = getValueList();

        function getZoneList(){
          var temp = [];
          for(var i = 0,length = data.length;i<length;i++){
            temp[i] = data[i].warZone;
          }
          return temp
        }

        function getQuarterList() {
          var temp = [];
          for(var i = 0,length = 4;i<length;i++){
            temp[i] = data[0].quarterData[i].quarter;
          }
          return temp
        }

        function getValueList() {
          var temp = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
          for(var i = 0;i<6;i++){
            for(var j = 0;j<4;j++){
              temp[i][j] = data[i].quarterData[j].rate;
            }
          }
          return temp
        }

        barChartOption = {
          tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            data: zoneList
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis : [
            {
              type : 'category',
              data : quarterList
            }
          ],
          yAxis : [
            {
              name: '车辆数量（辆）',
              type : 'value'
            }
          ],
          series : [
            {
              name:zoneList[0],
              type:'bar',
              data:valueList[0]
            },
            {
              name:zoneList[1],
              type:'bar',
              data:valueList[1]
            },
            {
              name:zoneList[2],
              type:'bar',
              data:valueList[2]
            },
            {
              name:zoneList[3],
              type:'bar',
              data:valueList[3]
            },
            {
              name:zoneList[4],
              type:'bar',
              data:valueList[4]
            },
            {
              name:zoneList[5],
              type:'bar',
              data:valueList[5]
            }
          ]
        };
        barChart2.setOption(barChartOption);
      })
    }

    getBar1_Data(1,2,1);
    getBar2_Data(1,2,2);

    $scope.query = function(){
      $http.get('assets/json/warzone.json').success(function(data) {
        echarts.registerMap('warZone', data);
        var _product_type1,_product_type2, _query_statistical_type1,_query_statistical_type2, _query_cycle_type, _query_cycle_value;
        if($scope.query_product_type1 == '挖掘机'){
          _product_type1 = '1'
        }else if($scope.query_product_type1 == '装载机'){
          _product_type1 = '2'
        }else{
          _product_type1 = '3'
        }
        if($scope.query_product_type2 == '挖掘机'){
          _product_type2 = '1'
        }else if($scope.query_product_type2 == '装载机'){
          _product_type2 = '2'
        }else{
          _product_type2 = '3'
        }
        if($scope.query_cycle_type == '按月查询'){
          _query_cycle_type = '1'
        }else{
          _query_cycle_type = '2'
        }
        _query_cycle_value = $scope.query_cycle_value;
        if($scope.query_statistical_type1 == '开工热度'){
          _query_statistical_type1 = '1'
        }else{
          _query_statistical_type1 = '2'
        }
        if($scope.query_statistical_type2 == '开工热度'){
          _query_statistical_type2 = '1'
        }else{
          _query_statistical_type2 = '2'
        }
        if($scope.query_cycle_type)
        getMap1_Data(_product_type1,_query_cycle_type, _query_cycle_value, $scope.query_hour, _query_statistical_type1);
        getMap2_Data(_product_type2,_query_cycle_type, _query_cycle_value, $scope.query_hour, _query_statistical_type2);
        getBar1_Data(_product_type1,$scope.query_hour,1);
        getBar2_Data(_product_type2,$scope.query_hour,2);
      })
    };

    $scope.$watch('query_cycle_type',function(newVal,oldVal){
      if(newVal !== oldVal){
        if(newVal == '按月查询'){
          $scope.cycle_value = timeList.monthList(2017,1)
        }else if(newVal == '按季度查询'){
          $scope.cycle_value = timeList.quarterList(2015,10)
        }
      }
    });

    function compare(property){
      return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
      }
    }
    var startYear = 2017, startMonth = 2;
    var i = 0;

    var time = new Date();
    console.log(time.getMonth());

    var length = (time.getFullYear() - startYear) * 12 + time.getMonth() - startMonth + 1;
    var result = [];
    for(i;i<length;i+=3){
      time.setMonth(time.getMonth() - 3);
      var q = Math.ceil(time.getMonth() / 3) + 1;
      result.push(time.getFullYear() + '0' + q);
    }

    console.log(result);
    console.log(length);

  }

}());
