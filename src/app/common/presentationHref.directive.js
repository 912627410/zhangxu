/**
 * Created by shuangshan on 16/1/2.
 */
(function () {
  'use strict';

  var GPSCloudModule = angular.module('GPSCloud');
  GPSCloudModule.directive('presentationHref', presentationHref);

  /** @ngInject */
  function presentationHref(permissions) {
    return {
      restrict: 'A',
      link: function ($scope, iElm, iAttrs) {
        var hrefs = iAttrs.presentationHref;
        !permissions.getPermissions(hrefs) && iElm.remove();
      }
    }

  }


  /**隐藏左侧栏*/
  GPSCloudModule.directive('toggels', function () {
    return {
      restrict: 'A',
      scope: false,
      link: function (scope, element, attrs) {
        element.bind("click", function () {
          var bodyDom = angular.element(document.body);
          var slimScroll = angular.element(document.getElementById("slimScroll"));
          var slimScroll2 = angular.element(document.getElementById("slimScroll2"));
          console.log(attrs.toggels);
          if (attrs.toggels == "true") {
            //不隐藏左侧菜单
            bodyDom.removeClass("sidebar-collapse");
            //添加左侧菜单变成可以下拉的class
            slimScroll.removeClass("slimScroll");
            slimScroll2.removeClass("slimScroll");
            slimScroll2.parent().removeClass("slimScroll");
            //改变隐藏左侧菜单的默认值
            attrs.$set('toggels', 'false');
          } else {
            //隐藏左侧菜单
            bodyDom.addClass("sidebar-collapse");
            //左侧菜单hover属性启用,需要设置三个值
            slimScroll.addClass("slimScroll");
            slimScroll2.addClass("slimScroll");
            slimScroll2.parent().addClass("slimScroll");
            //改变隐藏左侧菜单的默认值
            attrs.$set('toggels', 'true');
          }
        });
      }
    }
  })

  /**自定义列导出*/
  GPSCloudModule.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
  }])
    .directive('exportCsv', ['$parse', function ($parse) {
      return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
          var data = '';
          var csv = {
            stringify: function (str) {
              return '"' +
                str.replace(/^\s\s*/, '').replace(/\s*\s$/, '') // trim spaces
                  .replace(/"/g, '""') + // replace quotes with double quotes
                '"';
            },
            contains: function (arg, array) {
              for (var i = 0; i < array.length; i++) {
                if (arg == (array[i] - 1)) {
                  return false;
                }
              }
              return true;
            },
            generate: function () {
              var args = Array.prototype.slice.call(arguments);
              data = '';
              var rows = element.find('tr');
              angular.forEach(rows, function (row, i) {
                var tr = angular.element(row),
                  tds = tr.find('th'),
                  rowData = '';
                if (tr.hasClass('ng-table-filters')) {
                  return;
                }
                if (tds.length == 0) {
                  tds = tr.find('td');
                }
                angular.forEach(tds, function (td, i) {
                  if (csv.contains(i, args)) {
                    rowData += csv.stringify(angular.element(td).text()) + ';';
                  }
                });
                rowData = rowData.slice(0, rowData.length - 1); //remove last semicolon
                data += rowData + "\n";
              });
            },
            link: function () {
              return 'data:text/csv;charset=UTF-8,\ufeff' + encodeURIComponent(data);
            }
          };
          $parse(attrs.exportCsv).assign(scope.$parent, csv);
        }
      };
    }]);

  /**json导出成cvs*/
  GPSCloudModule.directive('ngJsonExportExcel', function () {
    return {
      restrict: 'AE',
      scope: {
        data: '=',
        filename: '=?',
        reportFields: '=',
        nestedReportFields: '=',
        nestedDataProperty: "@"
      },
      link: function (scope, element) {
        scope.filename = !!scope.filename ? scope.filename : "export-excel";

        function generateFieldsAndHeaders(fieldsObject, fields, header) {
          angular.forEach(fieldsObject, function (field, key) {
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
          angular.forEach(object, function (value, key) {
            output += key + ":" + value + " ";
          });

          return "'" + output + "'";
        }

        function generateFieldValues(list, rowItems, dataItem) {
          angular.forEach(list, function (field) {
            var data = "",
              fieldValue = "",
              curItem = null;
            if (field.indexOf(".")) {
              field = field.split(".");
              curItem = dataItem;
              // deep access to obect property
              angular.forEach(field, function (prop) {
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

          angular.forEach(scope.data, function (dataItem) {
            var rowItems = [];
            var nestedBody = "";
            rowItems = generateFieldValues(fields, rowItems, dataItem);
            //Nested Json body generation start
            if (scope.nestedDataProperty && dataItem[scope.nestedDataProperty].length) {
              angular.forEach(dataItem[scope.nestedDataProperty], function (nestedDataItem) {
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
        element.bind("click", function () {
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

  /**左侧菜单滚动条*/
  GPSCloudModule.directive('slimScroll', ['$document', '$window', function ($document, $window) {
    'use strict';
    var sDiv = '<div></div>';

    return {
      restrict: 'A',
      compile: function compile(element, attrs) {
        var el = element[0],
          width = attrs['width'] || 'auto',
          height = attrs['height'] || '100%',
          size = attrs['size'] || '7px',
          alwaysVisible = eval(attrs['alwaysVisible']) || false,
          railVisible = eval(attrs['railVisible']) || false,
          railBorderRadius = eval(attrs['railBorderRadius']) || '7px',
          railColor = attrs['railColor'] || '#333',
          railOpacity = attrs['railOpacity'] || .2,
          opacity = attrs['opacity'] || .4,
          color = attrs['color'] || '#000',
          borderRadius = attrs['borderRadius'] || '7px',
          position = attrs['position'] || 'right',
          distance = attrs['distance'] || '1px',
          allowPageScroll = eval(attrs['allowPageScroll']) || false,
          disableFadeOut = eval(attrs['disableFadeOut']) || false,
          wheelStep = attrs['wheelStep'] || 20,
          railDraggable = eval(attrs['railDraggable']) || true,
          touchScrollStep = attrs['touchScrollStep'] || 200,
          watchContent = eval(attrs['watchContent']) || false,
          barHeight = 30,
          minBarHeight = 30,
          percentScroll = 0,
          queueHide = 0,
          releaseScroll = false,
          lastScroll = 0,
          isOverPanel = false,
          isOverBar = false,
          isDrag = false,
          touchDif = 0;

        // update style for the div
        element.css({
          'overflow': 'hidden',
          'width': width,
          'height': height
        });

        // create wrapper
        var wrapper = angular.element(sDiv).css({
          'position': 'relative',
          'overflow': 'hidden',
          'width': width,
          'height': height
        });
        if (angular.isDefined(attrs['wrapperClass']))
          wrapper.addClass(attrs['wrapperClass']);

        // create scrollbar rail
        var rail = angular.element(sDiv).css({
          width: size,
          height: '100%',
          position: 'absolute',
          top: 0,
          display: (alwaysVisible && railVisible) ? 'block' : 'none',
          'border-radius': railBorderRadius,
          background: railColor,
          opacity: 0,
          zIndex: 90
        });
        if (angular.isDefined(attrs['railClass']))
          rail.addClass(attrs['railClass']);

        // create scrollbar
        var bar = angular.element(sDiv).css({
          background: color,
          width: size,
          position: 'absolute',
          top: 0,
          opacity: 0,
          display: alwaysVisible ? 'block' : 'none',
          'border-radius': borderRadius,
          BorderRadius: borderRadius,
          MozBorderRadius: borderRadius,
          WebkitBorderRadius: borderRadius,
          zIndex: 99
        });
        if (angular.isDefined(attrs['barClass']))
          bar.addClass(attrs['barClass']);

        // set position
        var posCss = (position == 'right') ? {right: distance} : {left: distance};
        rail.css(posCss);
        bar.css(posCss);

        var getBarHeight = function () {
          // calculate scrollbar height and make sure it is not too small
          barHeight = Math.max((el.offsetHeight / el.scrollHeight) * el.offsetHeight, minBarHeight);
          // hide scrollbar if content is not long enough
          var display = barHeight >= el.offsetHeight ? 'none' : 'block';
          bar.css({height: barHeight + 'px', display: display});
        };

        var showBar = function () {
          clearTimeout(queueHide);

          // recalculate bar height
          getBarHeight();

          // when bar reached top or bottom
          if (percentScroll == ~~percentScroll) {
            //release wheel
            releaseScroll = allowPageScroll;
          }
          else {
            releaseScroll = false;
          }
          lastScroll = percentScroll;

          // show only when required
          if (barHeight >= el.offsetHeight) {
            //allow window scroll
            releaseScroll = true;
            return;
          }

          if (disableFadeOut) bar.css({display: 'block'});
          else bar.css({transition: 'opacity 0.1s linear', opacity: opacity});
          if (railVisible) {
            if (disableFadeOut) rail.css({display: 'block'});
            else rail.css({display: 'block', transition: 'opacity 0.1s linear', opacity: railOpacity});
          }
        };

        var hideBar = function () {
          // only hide when options allow it
          if (!alwaysVisible) {
            queueHide = setTimeout(function () {
              if (!(disableFadeOut && isOverPanel) && !isOverBar && !isDrag) {
                if (disableFadeOut) bar.css({display: 'none'});
                else bar.css({transition: 'opacity 1s linear', opacity: 0});
                if (railVisible) {
                  if (disableFadeOut) rail.css({display: 'none'});
                  else rail.css({transition: 'opacity 1s linear', opacity: 0});
                }
              }
            }, 1000);
          }
        };

        var scrollContent = function (y, isWheel, isJump) {
          releaseScroll = false;
          var delta = y,
            maxTop = el.offsetHeight - bar[0].offsetHeight;

          if (isWheel) {
            // move bar with mouse wheel
            delta = parseInt(bar.css('top'), 10) + y * parseInt(wheelStep, 10) / 100 * bar[0].offsetHeight;

            // move bar, make sure it doesn't go out
            delta = Math.min(Math.max(delta, 0), maxTop);

            // if scrolling down, make sure a fractional change to the
            // scroll position isn't rounded away when the scrollbar's CSS is set
            // this flooring of delta would happened automatically when
            // bar.css is set below, but we floor here for clarity
            delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);

            // scroll the scrollbar
            bar.css({top: delta + 'px'});
          }

          // calculate actual scroll amount
          percentScroll = parseInt(bar.css('top'), 10) / (el.offsetHeight - bar[0].offsetHeight);

          delta = percentScroll * (el.scrollHeight - el.offsetHeight);

          if (isJump) {
            delta = y;
            var offsetTop = delta / el.scrollHeight * el.offsetHeight;
            offsetTop = Math.min(Math.max(offsetTop, 0), maxTop);
            bar.css({top: offsetTop + 'px'});
          }

          // scroll content
          delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);
          el.scrollTop = delta;

          // ensure bar is visible
          showBar();

          // trigger hide when scroll is stopped
          hideBar();
        };

        var _onWheel = function (e) {
          // use mouse wheel only when mouse is over
          if (!isOverPanel) {
            return;
          }

          e = e || $window.event;

          var delta = 0;
          if (e.wheelDelta) {
            delta = -e.wheelDelta / 120;
          }
          if (e.detail) {
            delta = e.detail / 3;
          }

          // scroll content
          scrollContent(delta, true);

          // stop window scroll
          if (e.preventDefault && !releaseScroll) {
            e.preventDefault();
          }
          if (!releaseScroll) {
            e.returnValue = false;
          }
        };

        // make it draggable
        if (railDraggable) {
          bar.on('mousedown', function (e) {
            var top = parseFloat(bar.css('top')),
              pageY = e.pageY;
            isDrag = true;

            $document.on('mousemove', function (e) {
              bar.css({'top': top + e.pageY - pageY + 'px'});
              // scroll content
              scrollContent(0, bar[0].offsetTop, false);
              e.stopPropagation();
              e.preventDefault();
              return false;
            });
            $document.on('mouseup', function () {
              isDrag = false;
              if (!isOverBar) hideBar();
              $document.off('mousemove');
            });
          }).on('selectstart', function (e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
          });
        }

        var attachWheel = function (target) {
          if ($window.addEventListener) {
            target.addEventListener('DOMMouseScroll', _onWheel, false);
            target.addEventListener('mousewheel', _onWheel, false);
          }
          else {
            $document.attachEvent("onmousewheel", _onWheel)
          }
        };

        // on rail over
        rail.on('mouseenter', function () {
          showBar();
        });
        rail.on('mouseleave', function () {
          hideBar();
        });

        // on bar over
        bar.on('mouseenter', function () {
          isOverBar = true;
        });
        bar.on('mouseleave', function () {
          isOverBar = false;
        });

        // show on parent mouseover
        element.on('mouseenter', function () {
          isOverPanel = true;
          showBar();
          hideBar();
        });
        element.on('mouseleave', function () {
          isOverPanel = false;
          hideBar();
        });

        // support for mobile
        element.on('touchstart', function (e) {
          //noinspection JSUnresolvedVariable
          if (e.originalEvent.touches.length) {
            // record where touch started
            //noinspection JSUnresolvedVariable
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });
        element.on('touchmove', function (e) {
          // prevent scrolling the page if necessary
          if (!releaseScroll) {
            //noinspection JSUnresolvedVariable
            e.originalEvent.preventDefault();
          }
          //noinspection JSUnresolvedVariable
          if (e.originalEvent.touches.length) {
            // see how far user swiped
            //noinspection JSUnresolvedVariable
            var diff = (touchDif - e.originalEvent.touches[0].pageY) / touchScrollStep;
            // scroll content
            scrollContent(diff, true);
            //noinspection JSUnresolvedVariable
            touchDif = e.originalEvent.touches[0].pageY;
          }
        });

        // attach scroll events
        attachWheel(el);

        return function postLink(scope, element) {
          // wrap it
          element.wrap(wrapper);

          // append to parent div
          element.append(bar);
          element.append(rail);

          // set up initial height
          getBarHeight();

          //watch if height change
          if (watchContent) {
            scope.$watch(function () {
              return el.offsetHeight / el.scrollHeight;
            }, function (newValue, oldValue) {
              //noinspection JSValidateTypes
              if (oldValue !== newValue) {
                getBarHeight();
                scrollContent(0, true);
              }
            });

            $window.addEventListener('resize', function () {
              scope.$apply();
            }, false);
          }
        };
      }
    }
  }]);
  //end
})();
