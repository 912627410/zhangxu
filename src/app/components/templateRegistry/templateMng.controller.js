/**
 * Created by mengwei on 17-4-1.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('templateMngController', templateMngController);

  /** @ngInject */
  function templateMngController($rootScope, $scope, $window, $uibModal,$state, NgTableParams, ngTableDefaults, serviceResource, DEFAULT_SIZE_PER_PAGE, TEMPLATE_URL) {
    var vm = this;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;//默认分页大小
    ngTableDefaults.settings.counts = [];//不使用naTable默认的分页条

    /**
     * 初始化模版页面数据
     *
     */
    var templateProviderData = serviceResource.restCallService(TEMPLATE_URL, "GET");
    templateProviderData.then(function (data) {
      vm.tableParams = new NgTableParams({}, {
        dataset: data.content
      });
      vm.page = data.page;
      vm.pageNumber = data.page.number + 1;
      vm.rspData = data.content;
      console.log(vm.rspData)
    }, function (reason) {
      Notification.error('获取模版失败');
    })

    /**
     * 分页获取模版数据
     * @param page
     * @param size
     * @param sort
     */
    vm.query = function (page, size, sort, template) {

    }

    /**
     * 新增模版
     *
     */
    vm.newTemplate = function () {
      $state.go("home.templateMng.new"); //转向新增模版页面
    }

    /**
     * 修改／展示当前的模版
     * @param template
     * @param size
     */
    vm.updateInfo = function (index) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/templateRegistry/updateTemplate.html',
        controller: 'updateTemplateController as updateTemplateCtrl',
        backdrop: false,
        resolve: {
          rspData: function () {
            return vm.rspData[index];
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.templateJson.push(result);
      }, function () {
        //取消
      });

    }


  }
})();

