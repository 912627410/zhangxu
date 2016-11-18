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
                    return 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
                }
            };
            $parse(attrs.exportCsv).assign(scope.$parent, csv);
        }
    };
}]);


})();
