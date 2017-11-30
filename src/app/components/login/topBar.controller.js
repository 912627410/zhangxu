/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('TopBarController', TopBarController);


  /** @ngInject */

  function TopBarController($translate) {
    var vm=this;

    /**
     * 切换语言
     * @param langKey
     */
    vm.changeLanguage = function (langKey) {
      $translate.use(langKey);
    }

  }
})();
