<?php

namespace common\components;

use Yii;
use yii\db\Exception;

/**
 * 查询命令的基类
 *
 * @author ChisWill
 */
class Command extends \yii\db\Command
{
    protected function queryInternal($method, $fetchMode = null)
    {
        try {
            return parent::queryInternal($method, $fetchMode);
        } catch (Exception $e) {
            if (!$this->pdoStatement) {
                throw $e;
            }
            $info = $this->pdoStatement->errorinfo();
            if ($info[1] == 2006 || $info[1] == 2013) {
                l(sprintf('时间：%s，数据：%s', date('Y-m-d H:i:s'), json_encode($info)), 'reconnect');
                $this->cancel();
                $this->db->close();
                $this->db->open();
                return parent::queryInternal($method, $fetchMode);
            }
            throw $e;
        }
    }
}
