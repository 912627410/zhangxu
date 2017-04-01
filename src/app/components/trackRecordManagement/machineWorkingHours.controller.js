/**
 * Created by mengwei on 17-3-31.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineWorkingHoursController', machineWorkingHoursController);

  /** @ngInject */
  function machineWorkingHoursController($rootScope, $scope,$http,$filter) {
    var vm = this;

    vm.startDateDeviceData = new Date();
    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    var myChartTop = echarts.init(document.getElementById('divRightTop'));
    var optionTop = {
      title: {
        text: '车辆工作时长分布'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return "车辆编号：" + params.seriesName + "<br/>"
            + "累计工作时长：" + params.data[0] + " 小时" + "<br/>"
            + "当日工作时长：" + params.data[1] + " 小时" + "<br/>"
            + "开工日期：" + params.data[2];
        }
      },
      grid: {
        left: 55,
        right: '7%',
        bottom: 30,
        containLabel: true
      },
      toolbox: {
        right: 50,
        feature: {
          dataZoom: {},
          brush: {
            type: []
          },
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      legend: {},
      xAxis: [
        {
          name: '累计工作时长(小时)',
          nameLocation: 'middle',
          type: 'value',
          scale: true,
          splitLine: {
            show: false
          },
          nameGap: 30
        }
      ],
      yAxis: [
        {
          name: '当日工作时长(小时)',
          type: 'value',
          scale: true,
          max : 24,
          minInterval: 1,
          splitLine: {
            show: false
          }
        }
      ],
      series: []
    };

    var jsonData = {
      "jsonMap": {
        "VLGL9560EG0600148": [[
          458.4,
          1.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550PG0601211": [[
          573.0,
          8.6,
          "2017-01-01"
        ]
        ],
        "VLGL9550VH0601944": [[
          1.6,
          0.2,
          "2017-01-01"
        ]
        ],
        "VLGL9550EG0600930": [[
          4.6,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550CG0600699": [[
          45.9,
          15.3,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600552": [[
          1060.2,
          4.4,
          "2017-01-01"
        ]
        ],
        "VLGL9550EG0600927": [[
          1.5,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL956FJG0600131": [[
          768.2,
          10.1,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600558": [[
          2.5,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9520LG0600055": [[
          638.7,
          8.6,
          "2017-01-01"
        ]
        ],
        "VLGL9530VG0600665": [[
          1037.3,
          14.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550CG0600693": [[
          1956.8,
          8.5,
          "2017-01-01"
        ]
        ],
        "VLGL9550PG0601225": [[
          2.5,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9560EG0600134": [[
          230.6,
          7.4,
          "2017-01-01"
        ]
        ],
        "VLGL9330LG0600818": [[
          24.7,
          1.4,
          "2017-01-01"
        ]
        ],
        "VLGL9550EG0600944": [[
          1.9,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL952DLG0600009": [[
          108.0,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550VH0601958": [[
          1.8,
          0.1,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600561": [[
          633.6,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530AG0600294": [[
          616.7,
          1.2,
          "2017-01-01"
        ]
        ],
        "VLGL9530EG0600803": [[
          337.0,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600566": [[
          288.9,
          2.3,
          "2017-01-01"
        ]
        ],
        "VLGL956FJG0600145": [[
          210.0,
          7.5,
          "2017-01-01"
        ]
        ],
        "VLGL9530VG0600679": [[
          565.7,
          8.6,
          "2017-01-01"
        ]
        ],
        "VLGL9520LG0600069": [[
          2.1,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLG00953EG0603292": [[
          1527.2,
          6.7,
          "2017-01-01"
        ]
        ],
        "VLGL952DLG0600012": [[
          665.9,
          2.2,
          "2017-01-01"
        ]
        ],
        "VLGE606FPG0600616": [[
          275.1,
          10.3,
          "2017-01-01"
        ]
        ],
        "VLGL9550VH0601961": [[
          1.6,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550JH0601987": [[
          1.5,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550PG0601239": [[
          453.2,
          7.5,
          "2017-01-01"
        ]
        ],
        "VLGL9560EG0600120": [[
          137.8,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550JH0601990": [[
          1.6,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600530": [[
          235.9,
          2.8,
          "2017-01-01"
        ]
        ],
        "VLGL956FJG0600159": [[
          100.6,
          6.2,
          "2017-01-01"
        ]
        ],
        "VLG00953EG0603289": [[
          457.6,
          3.1,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600535": [[
          729.3,
          3.1,
          "2017-01-01"
        ]
        ],
        "VLGL9530VG0600648": [[
          456.2,
          4.5,
          "2017-01-01"
        ]
        ],
        "VLGL9550PG0601242": [[
          168.9,
          1.2,
          "2017-01-01"
        ]
        ],
        "VLGL9560EG0600117": [[
          29.7,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550EG0600961": [[
          4.6,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL952DLG0600026": [[
          112.4,
          7.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530LG0600989": [[
          112.2,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530HH0601594": [[
          1.8,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550VH0601975": [[
          1.4,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9550EG0600958": [[
          97.4,
          0.9,
          "2017-01-01"
        ]
        ],
        "VLGL9530VG0600651": [[
          2384.9,
          16.5,
          "2017-01-01"
        ]
        ],
        "VLGL9520LG0600041": [[
          543.4,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530LG0600992": [[
          11.5,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600544": [[
          384.4,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530CG0600549": [[
          416.4,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL956FJG0600162": [[
          546.4,
          0.1,
          "2017-01-01"
        ]
        ],
        "VLGL9560EG0600103": [[
          3.7,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLG00953EG0603275": [[
          1475.1,
          5.4,
          "2017-01-01"
        ]
        ],
        "VLGL9550PG0601256": [[
          202.4,
          4.8,
          "2017-01-01"
        ]
        ],
        "VLGL9530TH0601597": [[
          1.6,
          0.0,
          "2017-01-01"
        ]
        ],
        "VLGL9530HH0601580": [[
          1.7,
          0.0,
          "2017-01-01"
        ]
        ]
      }
    }

    function dataPush(jsonData) {
      var seriesData = [];
      if(jsonData.jsonMap) {
        angular.forEach(jsonData.jsonMap, function (value, key) {
          seriesData.push({
            name: key,
            type: 'scatter',
            data: value,
            symbolSize: 6,
            itemStyle: {
              normal: {
                color: '#ce5d5a'
              }
            }
          });
        });
      }
      myChartTop.setOption(optionTop, true);
      myChartTop.setOption({series: seriesData});
    }
    dataPush(jsonData);













  }
})();
