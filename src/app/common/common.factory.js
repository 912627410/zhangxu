/**
 * Created by xiaopeng on 17-5-26.
 */
(function () {
  'use strict';
  var GPSCloudFactory = angular.module("GPSCloud");
  GPSCloudFactory.factory("commonFactory", function ($filter, filterFilter) {
    var factory = {}
    /**
     * 生成树需要制定parentId指向父id
     * @param arr
     * @returns {Array}
     */
    factory.unflatten = function (arr) {
      var tree = [], mappedArr = {}, arrElem, mappedElem;
      // First map the nodes of the array to an object -> create a hash table.
      for (var i = 0, len = arr.length; i < len; i++) {
        arrElem = arr[i];
        mappedArr[arrElem.id] = arrElem;
        mappedArr[arrElem.id]['children'] = [];
      }
      for (var id in mappedArr) {
        if (mappedArr.hasOwnProperty(id)) {
          mappedElem = mappedArr[id];
          // If the element is not at the root level, add it to its parent array of children.
          if (mappedElem.parentId!=null  && mappedArr.hasOwnProperty(mappedElem.parentId)) {
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
          }
          // If the element is at the root level, add it to first level elements array.
          else {
            tree.push(mappedElem);
          }
        }
      }
      return tree;
    }

    factory.recursiveChild = function (list, param) {
      for (var i = 0; i < list.length; i++) {

        if(list[i].children!=null && list[i].children.length > 0 ){
          factory.recursiveChild(list[i].children, param);
        }

        if (list[i][param] != null && list[i][param].length > 0 ) {
          for(var n=0; n <list[i][param].length; n ++ ){
            list[i].children.push(list[i][param][n]);

          }
        }

      }

    }

    /**
     *递归函数,获取上级item和当前的item
     * @param treeData
     * @param currentItem
     * @param parentItem
     */
    var searchNodes = function (treeData, currentItem, parentItem) {
      parentItem.push(currentItem)
      if (currentItem.parentId != null) {
        angular.forEach(treeData, function (data, indxe, array) {
          if (data.id == currentItem.parentId) {
            currentItem = data;
          }
        })
        searchNodes(treeData, currentItem, parentItem)
      }
    }
    /**
     *递归在给定的treeData里找currentItem获取上级,如果上级为空返回currentItem
     * @param treeData
     * @param currentItem
     * @returns {*}
     */
    factory.searchParent = function (treeData, currentItem) {
      if (currentItem.parentId != null) {
        var parentItem = [];
        searchNodes(treeData, currentItem, parentItem)
        return parentItem.reverse();
      }
      return currentItem;
    }

    factory.expandAll = function (object, arr) {
      angular.forEach(object, function(value, key) {
        if(value.children.length>0){
          arr.push(value);
          factory.expandAll (value.children, arr);
        }
      });
    }

    return factory;
  })
})();

