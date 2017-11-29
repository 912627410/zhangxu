/**
 * Created by shuangshan on 16/1/2.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);


  /** @ngInject */

  function LoginController($rootScope, $scope, $http, $cookies, $filter, $window, ORG_TREE_JSON_DATA_URL, SYS_CONFIG_URL, SYS_CONFIG_LIST_URL, GET_VERIFYCODE_URL, JUDGE_VERIFYCODE_URL, NO_PROCESS_NOTICE, Notification, serviceResource, permissions, Idle, languages) {
    var vm = this;
    var userInfo;
    var count = 0;
    vm.rememberMe = true;
    vm.isShow = false;
    var rootParent = {id: 0}; //默认根节点为0
    var verifyCodeInfo = {
      token: '',
      value: ''
    }

    /**
     * 通过后台返回的结构生成json tree
     * @param array 数组
     * @param parent 父id
     * @param tree 树
     * @returns {Array|*} 数组
     */
    vm.unflatten = function (array, parent, tree) {
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : {id: 0};
      var children = _.filter(array, function (child) {
        return child.parentId == parent.id;
      });
      if (!_.isEmpty(children)) {
        //判断是否是根节点
        if (parent.id == 0) {
          tree = children;
        } else {
          parent['children'] = children
        }
        _.each(children, function (child) {
          vm.unflatten(array, child, null)
        });
      }
      return tree;
    };


    /**
     * 每次重新加载ngView内容时发出
     */
    $scope.$on('$viewContentLoaded', function () {
      if (null != $cookies.getObject("LGUSER")) {
        var user = {};
        user.username = $cookies.getObject("LGUSER").username;
        user.password = '';
        vm.credentials = user;
        if (null == $cookies.getObject("LGSTATUS")) {
          var userobj = {};
          userobj.username = $cookies.getObject("LGUSER").username;
          userobj.authtoken = $cookies.getObject("LGUSER").authtoken;
          vm.loginBytoken(userobj);
        }
      }
    });

    /**
     * 改变用户名,密码框置空
     */
    vm.reset = function () {
      vm.credentials.password = null;
    }

    /**
     * 创建验证码
     */
    vm.createVerifyCode = function () {
      var rspdata = serviceResource.restCallService(GET_VERIFYCODE_URL, "GET");
      rspdata.then(function (data) {
        verifyCodeInfo = {
          token: data.token,
          value: data.verifyCode
        }
        vm.verifyCode = verifyCodeInfo.value;
      })
    }

    /**
     * 登录操作
     */
    vm.loginMe = function () {
      if (count < 2) {
        vm.userverify();
      } else {
        vm.createVerifyCode();
        var code = vm.code;
        if (null != code && "" != code) {
          var restCallURL = JUDGE_VERIFYCODE_URL;
          restCallURL += "?&token=" + verifyCodeInfo.token + '&code=' + code;
          var rspData = serviceResource.restCallService(restCallURL, "GET");
          rspData.then(function (data) {
            if (data.code == 1) {
              vm.userverify();
            }
          })
        } else {
          Notification.error("请输入验证码!");
        }
      }
    }

    /**
     * 根据token登录
     * @param userobj
     */
    vm.loginBytoken = function (userobj) {
      vm.createVerifyCode();
      var rspPromise = serviceResource.authenticateb(userobj);
      rspPromise.then(function (response) {
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo
        };
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        if (userInfo.userdto.organizationDto.logo != null && userInfo.userdto.organizationDto.logo != "") {
          $rootScope.logo = "assets/images/" + $rootScope.userInfo.userdto.organizationDto.logo;

        } else {
          $rootScope.logo = "assets/images/logo.png";
        }
        Notification.success(languages.findKey('loginSuccess'));

        //监控用户登录超时
        Idle.watch();
        vm.getPermission();

      }, function (reason) {
        vm.credentials.password = "";
        count = count + 1;
        if (count == 2) {
          $scope.isShow = true;
        }
        vm.changeVerifyCode();
      });
    }

    /**
     * 用户验证
     */
    vm.userverify = function () {
      var rspPromise = serviceResource.authenticatea(vm.credentials);
      rspPromise.then(function (response) {
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo
        };

        if (vm.rememberMe) {
          //检测是否存在cookie   LGUSER
          $cookies.remove("LGUSER");
          var cookieDate = {};
          cookieDate.username = vm.credentials.username;
          cookieDate.authtoken = userInfo.authtoken;
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 5);//设置cookie保存5天
          $cookies.putObject("LGUSER", cookieDate, {'expires': expireDate});
        }
        var passwordPattenStatus = data.passwordPattenStatus;
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        if (userInfo.userdto.organizationDto.logo != null && userInfo.userdto.organizationDto.logo != "") {
          $rootScope.logo = "assets/images/" + $rootScope.userInfo.userdto.organizationDto.logo;

        } else {
          $rootScope.logo = "assets/images/logo.png";
        }
        Notification.success(languages.findKey('loginSuccess'));
        $cookies.remove("LGSTATUS");
        //监控用户登录超时
        Idle.watch();
        vm.getPermission(passwordPattenStatus);
      }, function (reason) {
        Notification.error(reason.data.message);
        count = count + 1;
        if (count == 2) {
          $scope.isShow = true;
        }
        vm.changeVerifyCode();
        vm.code = "";
      });
    }

    /**
     * 获取权限
     * @param passwordPattenStatus
     */
    vm.getPermission = function (passwordPattenStatus) {
      var rspData = serviceResource.getPermission();
      rspData.then(function (data) {
        /**
         * 获取权限放到缓存中去
         */
        var permissionList = $filter("array2obj")(data.content, "permission");
        $rootScope.permissionList = permissionList;
        $window.sessionStorage["permissionList"] = JSON.stringify(permissionList);

        /**
         * 获取组织信息
         */
        if (permissions.getPermissions("config:organazitionPage")) {
          vm.getOrg();
        }

        /**
         * 消息提醒数量
         */
        if (permissions.getPermissions("user:notification")) {
          vm.getNotification();
        }

        //读取小挖型号参数
        var smallExcavatorURL = SYS_CONFIG_URL + "?name=SMALL_EXCAVATOR_MODEL";
        var smallExcavatorPromis = serviceResource.restCallService(smallExcavatorURL, "GET");
        smallExcavatorPromis.then(function (data) {
            $window.sessionStorage["SMALL_EXCAVATOR_MODEL"] = data.value;
            $rootScope.SMALL_EXCAVATOR_MODEL = data.value;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetSmallExcavatorModel'));
          }
        );

        //读取所有系统参数，放到rootscope中供其它controller使用
        var sysconfigUrl = SYS_CONFIG_LIST_URL;
        var sysconfigPromis = serviceResource.restCallService(sysconfigUrl, "QUERY");
        sysconfigPromis.then(function (data) {
            $window.sessionStorage["SYSCONFIG"] = data;
            $rootScope.SYSCONFIG = data;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetSysconfig'));
          }
        );

        //加载故障代码描述对照表
        $http.get('warningDtc.json').success(function (data) {
          $rootScope.warningDataDtc = data;
          $window.sessionStorage["warningDataDtc"] = JSON.stringify(data);

        });

        //加载sensor列表
        $http.get('sensor.json').success(function (data) {
          $rootScope.sensor = data;
          $window.sessionStorage["sensor"] = JSON.stringify(data);
        });


        //判断是否需要提示修改密码
        if (passwordPattenStatus == false) {
          Notification.error({message: '密码过于简单,请修改', positionX: 'center'});
        }

        $rootScope.$state.go('home');
      }, function (reason) {
      });
    }

    /**
     * 消息提醒的数量
     */
    vm.getNotification = function () {
      var noticePromise = serviceResource.restCallService(NO_PROCESS_NOTICE,"GET");
      noticePromise.then(function (data) {
        $rootScope.notificationNumber = data.content;
        $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
        },function (reason) {}
      )
    }

    /**
     * 读取组织结构信息
     */
    vm.getOrg = function () {
      var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL, "QUERY");
      rspData.then(function (data) {
        //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
        var orgParent = rootParent;
        if (null != userInfo.userdto.organizationDto) {
          orgParent.id = userInfo.userdto.organizationDto.id;
          rootParent.id = orgParent.id;
        }

        //生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
        var list = data;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == rootParent.id) {
            list[i].parentId = 0;
            break;
          }
        }
        $rootScope.orgChart = vm.unflatten(list);
        $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      });
    }


    /**
     * 刷新验证码
     */
    vm.changeVerifyCode = function () {
      var rspdata = serviceResource.restCallService(GET_VERIFYCODE_URL, "GET");
      rspdata.then(function (data) {
        verifyCodeInfo = {
          token: data.token,
          value: data.verifyCode
        }
        vm.verifyCode = verifyCodeInfo.value;
      })
      document.getElementById("verifyCode").value = "";
      vm.message = "";
    }

    /**
     * 验证码校验
     */
    vm.validate = function () {
      var code = vm.code;
      if (null != code && "" != code) {
        //前端进行验证
        if (code == verifyCodeInfo.value) {
          vm.message = "√";
          document.getElementById("Codemessage").style.color = "green";
        } else {
          vm.message = "×";
          document.getElementById("Codemessage").style.color = "Red";
        }
        var restCallURL = JUDGE_VERIFYCODE_URL;
        restCallURL += "?&token=" + verifyCodeInfo.token + '&code=' + code;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.code == 0) {
            Notification.error("验证码输入错误！请重新输入！!");
            $scope.disabled = true;
          }
        })
      }
    }

    var codebox = document.getElementsByClassName("login-box-body")
    if (typeof(codebox.onselectstart) != "undefined") {
      codebox.onselectstart = new Function("return false");
    } else {
      codebox.onmousedown = new Function("return false");
      codebox.onmouseup = new Function("return true");
    }
  }
})();
