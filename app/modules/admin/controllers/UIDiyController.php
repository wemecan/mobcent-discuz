<?php

/**
 * UI Diy 控制器
 *
 * @author 谢建平 <jianping_xie@aliyun.com>  
 * @copyright 2012-2014 Appbyme
 */

if (!defined('IN_DISCUZ') || !defined('IN_APPBYME')) {
    exit('Access Denied');
}

// Mobcent::setErrors();
class UIDiyController extends AdminController
{
    public function actionIndex()
    {   
        $newsModules = AppbymePoralModule::getModuleList();

        $navInfo = AppbymeUIDiyModel::getNavigationInfo();

        $modules = array();
        $tempModules = AppbymeUIDiyModel::getModules();
        $isFindDiscover = $isFindFastpost = false;
        $discoverModule = AppbymeUIDiyModel::initDiscoverModule();
        $fastpostModule = AppbymeUIDiyModel::initFastpostModule();

        foreach ($tempModules as $module) {
            switch ($module['id']) {
                case AppbymeUIDiyModel::MODULE_ID_DISCOVER:
                    if (!$isFindDiscover) {
                        $isFindDiscover = true;
                        $discoverModule = $module;
                    }
                    break;
                case AppbymeUIDiyModel::MODULE_ID_FASTPOST:
                    if (!$isFindFastpost) {
                        $isFindFastpost = true;
                        $fastpostModule = $module;
                    }
                    break;
                default:
                    $modules[] = $module;
                    break;
            }
        }
        array_unshift($modules, $discoverModule, $fastpostModule);

        $this->renderPartial('index', array(
            'navInfo' => $navInfo,
            'modules' => $modules,
            'newsModules' => $newsModules,
        ));
    }

    public function actionSaveNavInfo($navInfo)
    {
        $res = WebUtils::initWebApiResult();

        $navInfo = WebUtils::jsonDecode($navInfo);
        AppbymeUIDiyModel::saveNavigationInfo($navInfo);

        echo WebUtils::outputWebApi($res, '', false);
    }

    public function actionSaveModules($modules)
    {
        $res = WebUtils::initWebApiResult();

        $modules = WebUtils::jsonDecode($modules);
        AppbymeUIDiyModel::saveModules($modules);

        echo WebUtils::outputWebApi($res, '', false);
    }

    public function actionInit()
    {
        $res = WebUtils::initWebApiResult();

        AppbymeUIDiyModel::deleteModules();

        echo WebUtils::outputWebApi($res, '', false);
    }
}