/* global malarkey:false, moment:false */
(function() {
  'use strict';
   var SERVER_BASE_URL = 'http://localhost:8080/rest/';
  //生产环境的https协议地址
  //var SERVER_BASE_URL = 'https://iotserver2.nvr-china.com/rest/';
  angular
    .module('GPSCloud')
    .constant('malarkey', malarkey)
    .constant('SYSTEM_VERSION', '1.0.0')    //系统版本号
    .constant('DEFAULT_SIZE_PER_PAGE', 40)    //默认每页显示纪录数
    .constant('AMAP_QUERY_TIMEOUT_MS', 3000)  //高德地图api调用延时毫秒数
    .constant('DEFAULT_DEVICE_SORT_BY', 'lastDataUploadTime,desc')    //读取设备时的默认排序规则
    .constant('DEFAULT_USER_SORT_BY', 'ssn,desc')    //读取用户信息时的默认排序规则
    .constant('DEFAULT_DEVICE_DATA_SORT_BY', 'recordTime,desc')    //读取设备数据时的默认排序规则
    .constant('DEFAULT_DEVICE_WARNING_DATA_SORT_BY', 'warningTime,desc')    //读取设备报警数据时的默认排序规则
    .constant('DEFAULT_DEVICE_LOCK_DATA_SORT_BY','sendTime,desc')     //读取锁车短信的默认排序规则
    .constant('DEFAULT_NOTIFICATION_SORT_BY', 'recordTime,desc')    //读取提醒数据时的默认排序规则

    .constant('AMAP_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&callback=init')   //高德地图URL
    .constant('AMAP_GEO_CODER_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Geocoder')
    .constant('AMAP_PLACESEARCH_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Autocomplete,AMap.PlaceSearch')


    .constant('SERVER_BASE_URL', SERVER_BASE_URL)

    .constant('USER_LOGIN_URL', SERVER_BASE_URL + 'user/gettoken')
    .constant('USER_REGISTER_URL', SERVER_BASE_URL + 'user/register')
    .constant('HOME_GPSDATA_URL', SERVER_BASE_URL + 'deviceMonitor/deviceinfopage?search_EQ_locateStatus=A&page=0&size=100&sort=lastDataUploadTime,desc')       //主页中地图数据,默认前100条
    .constant('HOME_STATISTICS_DATA_URL', SERVER_BASE_URL + 'device/homedata')  //主页的统计数据URL
    .constant('DEVCE_PAGED_QUERY', SERVER_BASE_URL + 'device/deviceinfopage')   //分页查询设备信息URL
    .constant('DEVCE_MONITOR_PAGED_QUERY', SERVER_BASE_URL + 'deviceMonitor/deviceinfopage')   //分页查询设备监控信息URL
    .constant('DEVCE_MONITOR_SINGL_QUERY', SERVER_BASE_URL + 'deviceMonitor/deviceinfo')   //分页查询设备监控信息URL
    .constant('DEVCEINFO_PARAMETER_URL', SERVER_BASE_URL + 'deviceMonitor/deviceParameter')   //设备参数
    .constant('DEVCEINFO_URL', SERVER_BASE_URL + 'device/deviceinfo')   //设备crud
    .constant('DEVCE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicedata')   //分页查询设备数据URL
    .constant('DEVCE_SIMPLE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicesimpledata')   //分页查询设备简化数据URL
    .constant('DEVCEMONITOR_EXCELEXPORT', SERVER_BASE_URL + 'deviceMonitor/excelExport')   //数据导出简化URL
    .constant('DEVCEDATA_EXCELEXPORT', SERVER_BASE_URL + 'device/excelExport')   //devicedata导出
    .constant('DEVCE_NOUPLOAD_DATA_EXCELEXPORT', SERVER_BASE_URL + 'device/noUploadExcelExport')  //长时间未连接数据导出
    .constant('DEVCE_ECU_NOTACTIVE_QUERY', SERVER_BASE_URL + 'device/ecuNotActivePage')   //分页查询ecu未激活数据URL
    .constant('DEVCE_ECU_NOTACTIVE_EXCELEXPORT', SERVER_BASE_URL + 'device/ecuNotActiveExport')   //ecu未激活数据导出
    .constant('DEVCE_NORMAL_UNBOUND_QUERY', SERVER_BASE_URL + 'device/normalUnboundPage')   //分页查询正常解绑的车辆数据URL
    .constant('DEVCE_NORMAL_UNBOUND_EXPORT', SERVER_BASE_URL + 'device/normalUnboundExport')   //正常解绑的车辆导出
    .constant('DEVCEDINFO_EXCELEXPORT', SERVER_BASE_URL + 'device/deviceinfoexport')   //deviceInfoMng导出

    .constant('DEVCE_MF', SERVER_BASE_URL + 'config/mf')
    .constant('DEVCE_POWERTYPE', SERVER_BASE_URL + 'config/devicepowertype')
    .constant('DEVCE_HIGHTTYPE', SERVER_BASE_URL + 'config/deviceheighttype')
    .constant('DEVCE_DEVICETYPE', SERVER_BASE_URL + 'config/devicetype')

    .constant('DEVICEREPORT_ATTENDANCE_URL', SERVER_BASE_URL + 'deviceReport/getMachineAttendance')   //车辆出勤率
    .constant('DEVICEREPORT_EXPORT_URL', SERVER_BASE_URL + 'deviceReport/excelExport')   //deviceReport导出

    .constant('DEVCE_WARNING_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/warningdata')   //分页查询设备报警数据URL
    .constant('DEVCE_LOCK_DATA_PAGED_QUERY',SERVER_BASE_URL+'device/locksms')//分页查询设备锁车数据url
    .constant('RESET_PASSWORD_URL', SERVER_BASE_URL + 'user/password')   //修改用户密码
    .constant('SUPER_RESET_PASSWORD_URL', SERVER_BASE_URL + 'user/superpassword')   //管理员修改用户密码
    .constant('USERINFO_URL', SERVER_BASE_URL + 'user/userinfo')   //用户基本信息
    .constant('USER_GROUPBY_ROLE_URL', SERVER_BASE_URL + 'user/userinfobyrole')   //按照role分组得到用户信息
    .constant('USER_PAGED_URL', SERVER_BASE_URL + 'user/userinfopage')   //用户信息分页
    .constant('NOTIFICATION_PAGED_URL', SERVER_BASE_URL + 'user/notification')   //用户提醒信息分页
    .constant('NOTIFICATION_STATISTICS_URL', SERVER_BASE_URL + 'user/notificationStatistics')   //用户提醒数量统计数据
    .constant('ORG_TREE_JSON_DATA_URL', SERVER_BASE_URL + 'config/organazition')   //组织机构信息,返回树状json代码
    .constant('QUERY_PARENTORG_URL', SERVER_BASE_URL + 'config/queryParentOrg')


    .constant('GET_VERIFYCODE_URL', SERVER_BASE_URL + 'user/getverifyCode')   //获取验证码
    .constant('JUDGE_VERIFYCODE_URL', SERVER_BASE_URL + 'user/judgeverifyCode')   //验证码判断
    .constant('GET_PASSWORD_URL', SERVER_BASE_URL + 'user/getpassword')   //获取密码
    .constant('USER_LOGINBYTOKEN_URL', SERVER_BASE_URL + 'user/loginBytoken')




    //车辆管理相关
    .constant('MACHINE_PAGE_URL',SERVER_BASE_URL + 'machine/machinepage') //车辆信息分页
    .constant('MACHINE_LOANPAGE_URL',SERVER_BASE_URL + 'machine/loanMachinePage') //车辆信息分页
    .constant('MACHINE_URL', SERVER_BASE_URL + 'machine/machine')   //车辆基本信息
    .constant('MACHINE_MOVE_ORG_URL', SERVER_BASE_URL + 'machine/moveOrg')   //车辆调拨
    .constant('MACHINE_MOVE_FLEET_URL', SERVER_BASE_URL + 'machine/moveFleet')   //车辆借调
    .constant('MACHINE_UNBIND_DEVICE_URL', SERVER_BASE_URL + 'machine/unbindDevice')   //设备解绑
    .constant('MACHINE_SALARY_TYPE_URL', SERVER_BASE_URL + 'machine/salaryType')   //人工成本类型
    .constant('MACHINE_UPKEETP_PRICE_TYPE_URL', SERVER_BASE_URL + 'machine/upkeepPriceType')   //保养成本类型
    .constant('MACHINE_UPLOADTEMPLATE_DOWNLOAD_URL', SERVER_BASE_URL + 'machine/uploadTemplateDownload')   //车辆导入模板下载
    .constant('MACHINE_UPLOAD_URL', SERVER_BASE_URL + 'machine/upload')   //车辆批量导入
    .constant('MACHINE_FENCE',SERVER_BASE_URL+'machine/setfence')  //车辆电子围栏



    //系统参数相关
    .constant('SYS_CONFIG_URL', SERVER_BASE_URL + 'config/sysconfig')
    .constant('SYS_CONFIG_LIST_URL', SERVER_BASE_URL + 'config/sysconfigList')//系统参数List
    .constant('SYS_CONFIG_PAGE_URL',SERVER_BASE_URL + 'config/sysconfigpage')//系统参数信息分

    //sim卡管理相关
    .constant('SIM_PAGE_URL',SERVER_BASE_URL + 'sim/simpage') //sim卡信息分页
    .constant('SIM_URL', SERVER_BASE_URL + 'sim/sim')   //sim基本信息
    .constant('SIM_UPLOAD_URL', SERVER_BASE_URL + 'sim/upload')   //sim批量导入
    .constant('SIM_STATUS_URL', SERVER_BASE_URL + 'sim/simStatus')   //sim基本信息
    .constant('SIM_UNUSED_URL', SERVER_BASE_URL + 'sim/unused')   //批量返回未使用
    .constant('SIM_FETCH_UNUSED_URL', SERVER_BASE_URL + 'sim/fetchUnused')   //动态查询未使用的
    .constant('SIM_LOCATION_URL', SERVER_BASE_URL + 'sim/simLocation')   //查询sim卡定位信息
    .constant('SIM_STATUS_URL', SERVER_BASE_URL + 'sim/simStatus')   //查询sim卡状态
    .constant('SIM_GRPS_URL', SERVER_BASE_URL + 'sim/simGprs')   //查询GPRS使用信息
    .constant('SIM_PROVIDER_URL', SERVER_BASE_URL + 'sim/simProvider')   //查询sim卡供应商使用信息

    .constant('ENGINE_TYPE_LIST_URL', SERVER_BASE_URL + 'config/enginetype')   //发动机类型集合

    .constant('DEIVCIE_TYPE_LIST_URL', SERVER_BASE_URL + 'deviceType/deviceTypeList')   //设备类型集合
    .constant('DEIVCIE_PROTOCAL_TYPE_LIST_URL', SERVER_BASE_URL + 'device/protocalTypeList')   //设备协议类型集合
    .constant('DEIVCIE_NOT_REGISTER_LIST_URL', SERVER_BASE_URL + 'device/notRegisterList')   //设备协议类型集合
    .constant('DEIVCIE_MOVE_ORG_URL', SERVER_BASE_URL + 'device/moveOrg')   //设备调拨
    .constant('DEIVCIE_FETCH_UNUSED_URL', SERVER_BASE_URL + 'device/fetchUnused')   //动态查询未使用的

    .constant('DEIVCIE_UNLOCK_FACTOR_URL', SERVER_BASE_URL + 'device/deviceunlock')   //查询解锁url

    //短信相关URL
    .constant('GET_ACTIVE_SMS_URL', SERVER_BASE_URL + 'sms/getActiveSms')   //得到短消息内容
    .constant('SEND_ACTIVE_SMS_URL', SERVER_BASE_URL + 'sms/sendActiveSms')   //发送短消息
    .constant('GET_UN_ACTIVE_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/getUnActiveLockSMS')   //得到短消息内容
    .constant('SEND_UN_ACTIVE_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/sendUnActiveLockSMS')   //发送短消息
    .constant('GET_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/getLockSMS')   //得到短消息内容
    .constant('SEND_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/sendLockSMS')   //发送短消息
    .constant('GET_UN_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/getUnLockSMS')   //得到短消息内容
    .constant('SEND_UN_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/sendUnLockSMS')   //发送短消息
    .constant('GET_SET_IP_SMS_URL', SERVER_BASE_URL + 'sms/getSetIpSMS')   //得到短消息内容
    .constant('SEND_SET_IP_SMS_URL', SERVER_BASE_URL + 'sms/sendSetIpSMS')   //发送短消息
    .constant('GET_SET_START_TIMES_SMS_URL', SERVER_BASE_URL + 'sms/getSetStartTimesSMS')   //得到短消息内容
    .constant('SEND_SET_START_TIMES_SMS_URL', SERVER_BASE_URL + 'sms/sendSetStartTimesSMS')   //发送短消息
    .constant('GET_SET_WORK_HOURS_SMS_URL', SERVER_BASE_URL + 'sms/getSetWorkHoursSMS')   //得到短消息内容
    .constant('SEND_SET_WORK_HOURS_SMS_URL', SERVER_BASE_URL + 'sms/sendSetWorkHoursSMS')   //发送短消息
    .constant('GET_SET_INTER_SMS_URL', SERVER_BASE_URL + 'sms/getSetInterSMS')   //得到短消息内容
    .constant('SEND_SET_INTER_SMS_URL', SERVER_BASE_URL + 'sms/sendSetInterSMS')   //发送短消息
    .constant('SMS_SEND_REPORT_URL', SERVER_BASE_URL + 'sms/smsSendReport')   //短信发送报表

    //键盘数据相关
    .constant('VIEW_BIND_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getBindInputMsg')
    .constant('VIEW_UN_BIND_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getUnBindInputMsg')
    .constant('VIEW_LOCK_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getLockInputMsg')
    .constant('VIEW_UN_LOCK_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getUnLockInputMsg')
    .constant('VIEW_CANCEL_LOCK_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getCancelLockInputMsg')
    .constant('VIEW_SMS_URL', SERVER_BASE_URL + 'sms/getsms')   //得到短消息内容
    .constant('SEND_SMS_URL', SERVER_BASE_URL + 'sms/sendsms')   //发送短消息


    .constant('VIEW_KEYBOARD_MSG_URL', SERVER_BASE_URL + 'device/keyboard')   //得到键盘输入数据

    .constant('DEVCE_CHARGER_DATA', SERVER_BASE_URL + 'deviceCharger/deviceChargerData')  //市电电压


    .constant('PERMISSIONS_URL', SERVER_BASE_URL + 'user/permissions')   //得到登陆用户的权限信息

    //角色相关
    .constant('ROLE_PAGE_URL', SERVER_BASE_URL + 'role/rolePage')   //角色的分页信息
    .constant('ROLE_OPER_URL', SERVER_BASE_URL + 'role/roleOper')   //角色基本CRUD信息
    .constant('ROLE_USER_LIST_URL', SERVER_BASE_URL + 'role/roleUserinfoList')   //角色用户信息
    .constant('ROLE_USER_OPER_URL', SERVER_BASE_URL + 'role/roleUserinfoOper')   //角色用户更新
    .constant('ROLE_PRIVILAGE_LIST_URL', SERVER_BASE_URL + 'role/rolePriviligeList')   //角色权限信息
    .constant('ROLE_PRIVILAGE_OPER_URL', SERVER_BASE_URL + 'role/rolePriviligeOper')   //角色权限更新

    .constant('USER_ROLE_LIST_URL', SERVER_BASE_URL + 'role/userinfoRoleList')   //角色用户信息
    .constant('USER_ROLE_OPER_URL', SERVER_BASE_URL + 'role/userinfoRoleOper')   //角色用户更新
    .constant('PRIVILAGE_ROLE_LIST_URL', SERVER_BASE_URL + 'role/priviligeRoleList')   //角色权限信息
    .constant('PRIVILAGE_ROLE_OPER_URL', SERVER_BASE_URL + 'role/priviligeRoleOper')   //角色权限更新

    //权限相关
    .constant('PRIVILAGE_PAGE_URL', SERVER_BASE_URL + 'privilige/priviligePage')   //权限的分页信息
    .constant('PRIVILAGE_OPER_URL', SERVER_BASE_URL + 'privilige/priviligeOper')   //权限基本CRUD信息
    .constant('PRIVILAGE_STATUS_URL', SERVER_BASE_URL + 'privilige/statusList')   //权限状态信息
    .constant('PRIVILAGE_STATUS_DISABLE_URL', SERVER_BASE_URL + 'privilige/statusDisable')   //权限禁止
    .constant('PRIVILAGE_STATUS_ENABLE_URL', SERVER_BASE_URL + 'privilige/statusEnable')   //权限启用
    .constant('USER_PRIV_EXPORT_URL', SERVER_BASE_URL + 'privilige/userPrivExport')   //用户权限导出

    //用户相关
    .constant('USER_PAGE_URL', SERVER_BASE_URL + 'user/userinfoPage')   //用户信息分页
    .constant('USER_STATUS_URL', SERVER_BASE_URL + 'user/statusList')   //权限状态信息
    .constant('USER_STATUS_DISABLE_URL', SERVER_BASE_URL + 'user/statusDisable')   //权限禁止
    .constant('USER_STATUS_ENABLE_URL', SERVER_BASE_URL + 'user/statusEnable')   //权限启用

    // 燃油配置相关
    .constant('FUEL_CONFIG_PAGE_URL', SERVER_BASE_URL + 'fuelConfig/fuelConfigpage')   //燃油配置查询
    .constant('FUEL_CONFIG_OPER_URL', SERVER_BASE_URL + 'fuelConfig/fuelConfig')   //燃油配置CRUD



    .constant('ORG_TYPE_URL', SERVER_BASE_URL + 'config/orgTypeList')   //组织类型查询
    .constant('ORG_UPDATE_URL', SERVER_BASE_URL + 'org/updateOrg')   //修改组织
    .constant('ORG_ADD_URL', SERVER_BASE_URL + 'org/newOrg')   //新增组织
    .constant('NOTICE_PAGE_URL', SERVER_BASE_URL + 'notice/noticePage')   //保养提醒消息page


    //车队管理
    .constant('REVENUE_URL', SERVER_BASE_URL + 'fleetRecord/revenue') //收入统计
    .constant('COST_URL', SERVER_BASE_URL + 'cost/costpage') //成本统计
    .constant('FLEET_PAGE_URL', SERVER_BASE_URL + 'fleetRecord/fleetRecordPage') //分页查询

    //按车队查询distance
    .constant('DEVCE_DISTANCE_TOFLEET_PAGE', SERVER_BASE_URL + 'fleet/distanceToFleetPage')

    .constant('FLEET_MAPDATA', SERVER_BASE_URL + 'fleet/fleetMapData') //地图调拨
    .constant('FLEET_CHARTDATA', SERVER_BASE_URL + 'fleet/fleetChartData') //图表调拨
    .constant('FLEET_DOUBLECHART_DATA', SERVER_BASE_URL + 'fleet/fleetDoubleChartData') //图表调拨
    .constant('FLEETINFO_PAGE_URL', SERVER_BASE_URL + 'fleet/fleetPage') //车队信息分页查询
    .constant('FLEETINFO_URL', SERVER_BASE_URL + 'fleet/fleetOper') //车队信息CRUD
    .constant('FLEET_WORKPLANE_RELA', SERVER_BASE_URL + 'fleet/fleetWorkplaneRela') //车队信息CRUD

    //作业面
    .constant('WORKPLANE_URL', SERVER_BASE_URL + 'workplane/workplane')   //作业面CRUD
    .constant('WORKPLANE_LIST', SERVER_BASE_URL + 'workplane/workplaneList')   //作业面List
    .constant('WORKPLANE_PAGE', SERVER_BASE_URL + 'workplane/workplanePage')   //作业面page

    .constant('FUEL_TYPE_URL', SERVER_BASE_URL + 'fuelConfig/fuelType')   //燃油类型
    .constant('FUEL_CONFIGT_LIST_URL', SERVER_BASE_URL + 'fuelConfig/fuelConfigList')   //燃油类型

    //称重数据
    .constant('WEIGHTDATA_PAGE_URL', SERVER_BASE_URL + 'weightData/weightDataPage')   //称重数据page
    .constant('ANALYSIS_INFLUX', SERVER_BASE_URL + 'analysis/')
    .constant('ANALYSIS_POSTGRES', SERVER_BASE_URL + 'analysis/getanalysisdata')


    .constant('LOAD_RECENT_UPLOAD_PAGE_URL', SERVER_BASE_URL + 'deviceMonitor/deviceDataWeekly')   //最近一周上传数据
    .constant('LOAD_TODAY_UPLOAD_PAGE_URL', SERVER_BASE_URL + 'deviceMonitor/deviceDataToday')   //当天数据上传

    //用户画像部分
    .constant('PORTRAIT_ENGINEPERFORMS_URL', SERVER_BASE_URL + 'portrait/getEnginePerforms')   //获取发动机评分
    .constant('PORTRAIT_RECENTLYSPEED_URL', SERVER_BASE_URL + 'portrait/getRecentlySpeed')   //获取最近的速度
    .constant('PORTRAIT_RECENTLYOIL_URL', SERVER_BASE_URL + 'portrait/getRecentlyOil')   //获取最近的oil
    .constant('PORTRAIT_WORKTIMELABEL_URL', SERVER_BASE_URL + 'portrait/getWorktimeAndStartTimes')   //获取最近的速度
    .constant('PORTRAIT_MACHINEEVENT_URL', SERVER_BASE_URL + 'portrait/getMachineEvent')   //获取事件List
    .constant('PORTRAIT_CUSTOMERINFO_URL', SERVER_BASE_URL + 'portrait/getCustomerInfo')   //获取客户信息


    .constant('MACHINE_ALLOCATION', SERVER_BASE_URL + 'audit/queryallocationlog')   //查询车辆调拨日志
    .constant('DEVCE_ALLOCATION', SERVER_BASE_URL + 'audit/queryallocationlog')   //查询设备调拨日志

    .constant('OPERATION_LOG_QUERY', SERVER_BASE_URL + 'audit/operationLogQuery')   //系统日志查询


    //org相关
    .constant('ORG_TREE_JSON_DATA_URL', SERVER_BASE_URL + 'config/organazition')   //组织机构信息,返回树状json代码
    .constant('ORG_URL', SERVER_BASE_URL + 'config/organization')   //组织基本信息
    .constant('ORG_ID_URL', SERVER_BASE_URL + 'config/getOrgById')   //根据ID查询组织信息
    .constant('ORG_PARENTID_URL', SERVER_BASE_URL + 'config/getOrgByParentId')   //根据parentId查询组织信息


    //高空车短信 by mariqian 20170306
    .constant('VIEW_SMS_EMCLOUD_URL', SERVER_BASE_URL + 'sms_emcloud/getsms')   //得到短消息内容
    .constant('SEND_SMS_EMCLOUD_URL', SERVER_BASE_URL + 'sms_emcloud/sendsms')   //发送短消息

  ;


})();
