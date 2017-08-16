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
        //如果是一级菜单，则不显示菜单上的权限项 ，例如"仪表盘"菜单，不显示"仪表盘"权限
        if(list[i].parentId == null){
          list[i][param] = [];
        }

        if(list[i].children!=null && list[i].children.length > 0 ){
          factory.recursiveChild(list[i].children, param);
        }

        if (list[i][param] != null && list[i][param].length > 0 ) {
          for(var n=0; n <list[i][param].length; n ++ ){
            //如果子菜单名不和权限名重复就插入权限
            var index = _.findIndex(list[i].children, function(node) {
                return node.name == list[i][param][n].name;
              });
            if(index== -1) {
              list[i].children.push(list[i][param][n]);
            }

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

    /**
     *
     * @param restCallURL url条件
     * @param searchConditions 搜索条件
     */
    factory.processSearchConditions=function (restCallURL, searchConditions) {
      for (var prop in searchConditions){
        var value = searchConditions[prop];
        if(typeof value=='string'){
          if (value.replace(/(^\s*)|(\s*$)/g,"")==''){
              value=null;
          }
        }
        if (value==null || value==undefined ){
          continue;
        }
        restCallURL =restCallURL +"&"+prop+"="+value;
      }
      return restCallURL;
    }

    return factory;
  })
})();

