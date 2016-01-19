/**
 * Created by shuangshan on 16/1/19.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('organazitionController', organazitionController);

  /** @ngInject */
  function organazitionController($rootScope,$scope,serviceResource,ORG_TREE_JSON_DATA_URL,Notification) {
    var vm = this;
    var apple_selected, tree, treedata_org;
    vm.my_tree_handler = function(branch) {
      var _ref;
      vm.output = "You selected: " + branch.id;
      if ((_ref = branch.data) != null ? _ref.description : void 0) {
        return vm.output += '(' + branch.data.description + ')';
      }
    };
    apple_selected = function(branch) {
      return vm.output = "APPLE! : " + branch.label;
    };

    vm.my_data=[$rootScope.orgChart[0]];
    vm.my_data[0].label = '组织架构';
    //示例代码
    //vm.my_data = [{
    //  label: "11111",
    //  children: [
    //    {
    //      label: "222222",
    //      leaf: true
    //    }
    //  ]
    //}];

  }
})();


