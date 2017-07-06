/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  var GPSCloudModule = angular.module('GPSCloud');
  GPSCloudModule.directive('presentationHref',presentationHref);

  /** @ngInject */
    function presentationHref(permissions) {
      return {
         restrict:'A',
         link:function($scope,iElm,iAttrs){
           var hrefs = iAttrs.presentationHref;
           !permissions.getPermissions(hrefs)&&iElm.remove();
         }
      }

    }


  /**隐藏左侧栏*/
  GPSCloudModule.directive('toggels', function () {
      return {
        restrict:'A',
        scope: false,
        link:function (scope,element,attrs) {
          element.bind("click", function () {
            var bodyDom =angular.element(document.body);
            if(attrs.toggels=="true"){
              bodyDom.addClass("sidebar-collapse");
              attrs.$set('toggels','false');
            }else{
              bodyDom.removeClass("sidebar-collapse");
              attrs.$set('toggels','true');
            }
          });
        }
      }
    })
 /**自定义列导出*/
  GPSCloudModule.config(['$compileProvider', function($compileProvider) {
    // allow data links
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
  }])
   .directive('exportCsv', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var data = '';
            var csv = {
                stringify: function(str) {
                    return '"' +
                        str.replace(/^\s\s*/, '').replace(/\s*\s$/, '') // trim spaces
                            .replace(/"/g,'""') + // replace quotes with double quotes
                        '"';
                },
                contains:function(arg,array){
                   for(var i=0;i<array.length;i++){
                    if(arg ==(array[i]-1)){
                      return false;
                    }
                   }
                  return true;
                },
                generate: function() {
                  var args = Array.prototype.slice.call(arguments);
                    data = '';
                    var rows = element.find('tr');
                    angular.forEach(rows, function(row, i) {
                        var tr = angular.element(row),
                            tds = tr.find('th'),
                            rowData = '';
                        if (tr.hasClass('ng-table-filters')) {
                            return;
                        }
                        if (tds.length == 0) {
                            tds = tr.find('td');
                        }
                        angular.forEach(tds, function(td, i) {
                            if(csv.contains(i,args)){
                                rowData += csv.stringify(angular.element(td).text()) + ';';
                            }
                        });
                        rowData = rowData.slice(0, rowData.length -1); //remove last semicolon
                        data += rowData + "\n";
                    });
                },
                link: function() {
                    return 'data:text/csv;charset=UTF-8,\ufeff'+encodeURIComponent(data);
                }
            };
            $parse(attrs.exportCsv).assign(scope.$parent, csv);
        }
    };
}]);

  /**json导出成cvs*/
  GPSCloudModule.directive('ngJsonExportExcel', function() {
    return {
      restrict: 'AE',
      scope: {
        data: '=',
        filename: '=?',
        reportFields: '=',
        nestedReportFields: '=',
        nestedDataProperty: "@"
      },
      link: function(scope, element) {
        scope.filename = !!scope.filename ? scope.filename : "export-excel";

        function generateFieldsAndHeaders(fieldsObject, fields, header) {
          angular.forEach(fieldsObject, function(field, key) {
            if (!field || !key) {
              throw new Error("error json report fields");
            }
            fields.push(key);
            header.push(field);
          });
          return {
            fields: fields,
            header: header
          };
        }
        var fieldsAndHeader = generateFieldsAndHeaders(scope.reportFields, [], []);
        var fields = fieldsAndHeader.fields,
          header = fieldsAndHeader.header;
        var nestedFieldsAndHeader = generateFieldsAndHeaders(scope.nestedReportFields, [], [""]);
        var nestedFields = nestedFieldsAndHeader.fields,
          nestedHeader = nestedFieldsAndHeader.header;

        function _convertToExcel(body, header) {
          return header + "\n" + body;
        }

        function _objectToString(object) {
          var output = "";
          angular.forEach(object, function(value, key) {
            output += key + ":" + value + " ";
          });

          return "'" + output + "'";
        }

        function generateFieldValues(list, rowItems, dataItem) {
          angular.forEach(list, function(field) {
            var data = "",
              fieldValue = "",
              curItem = null;
            if (field.indexOf(".")) {
              field = field.split(".");
              curItem = dataItem;
              // deep access to obect property
              angular.forEach(field, function(prop) {
                if (curItem !== null && curItem !== undefined) {
                  curItem = curItem[prop];
                }
              });
              data = curItem;
            } else {
              data = dataItem[field];
            }
            fieldValue = data !== null ? data : " ";
            if (fieldValue !== undefined && angular.isObject(fieldValue)) {
              fieldValue = _objectToString(fieldValue);
            }
            rowItems.push(fieldValue);
          });
          return rowItems;
        }

        function _bodyData() {
          var body = "";

          angular.forEach(scope.data, function(dataItem) {
            var rowItems = [];
            var nestedBody = "";
            rowItems = generateFieldValues(fields, rowItems, dataItem);
            //Nested Json body generation start
            if (scope.nestedDataProperty && dataItem[scope.nestedDataProperty].length) {
              angular.forEach(dataItem[scope.nestedDataProperty], function(nestedDataItem) {
                var nestedRowItems = [""];
                nestedRowItems = generateFieldValues(nestedFields, nestedRowItems, nestedDataItem);
                nestedBody += nestedRowItems.toString() + "\n";
              });
              var strData = _convertToExcel(nestedBody, nestedHeader);
              body += rowItems.toString() + "\n" + strData;
              ////Nested Json body generation end
            } else {
              body += rowItems.toString() + "\n";
            }
          });
          return body;
        }

        // $timeout(function() {
        element.bind("click", function() {
          var bodyData = _bodyData();
          var strData = _convertToExcel(bodyData, header);
          var blob = new Blob([strData], {
            type: "text/plain;charset=utf-8"
          });

          return saveAs(blob, [scope.filename + ".csv"]);
        });
        // }, 1000);

      }
    };
  });


  /**
   *  time line
   */

  GPSCloudModule.directive("timeaxisItem", function () {
    return {
      require: '^timeaxis',
      restrict: 'AE',
      transclude: true,
      template: '<li ng-class-even="\'timeaxis-inverted\'" ng-transclude ng-style-even="\'machineMaintenanceCtrl.addLength\'"></li>'
    };
  });

  //end
})();
