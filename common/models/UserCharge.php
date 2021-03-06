<?php

namespace common\models;

use Yii;

/**
 * 这是表 `user_charge` 的模型
 */
class UserCharge extends \common\components\ARModel
{
    const CHARGE_STATE_WAIT = 1;
    const CHARGE_STATE_PASS = 2;
    const CHARGE_STATE_FAIL = -1;

    public function rules()
    {
        return [
            [['user_id', 'trade_no', 'amount', 'rest_amount'], 'required'],
            [['user_id', 'charge_type', 'charge_state'], 'integer'],
            [['amount', 'rest_amount', 'fee'], 'number'],
            [['created_at', 'updated_at'], 'safe'],
            [['trade_no'], 'string', 'max' => 250]
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => '用户ID',
            'trade_no' => '订单编号',
            'amount' => '充值金额',
            'rest_amount' => '余额',
            'fee' => '手续费',
            'charge_type' => '充值方式：1支付宝，2微信，3银联',
            'charge_state' => '充值状态：1待付款，2成功，-1失败',
            'created_at' => '充值时间',
            'updated_at' => '到账时间',
        ];
    }

    /****************************** 以下为设置关联模型的方法 ******************************/

    // 关联 User 模型
    public function getUser()
    {
        return $this->hasOne(User::className(), ['id' => 'user_id']);
    }

    /****************************** 以下为公共显示条件的方法 ******************************/

    public function search()
    {
        $this->setSearchParams();

        return self::find()
            ->filterWhere([
                'userCharge.id' => $this->id,
                'userCharge.user_id' => $this->user_id,
                'userCharge.amount' => $this->amount,
                'userCharge.rest_amount' => $this->rest_amount,
                'userCharge.fee' => $this->fee,
                'userCharge.charge_type' => $this->charge_type,
                'userCharge.charge_state' => $this->charge_state,
            ])
            ->andFilterWhere(['like', 'userCharge.trade_no', $this->trade_no])
            ->andFilterWhere(['like', 'userCharge.created_at', $this->created_at])
            ->andFilterWhere(['like', 'userCharge.updated_at', $this->updated_at])
            ->andTableSearch()
        ;
    }

    /****************************** 以下为公共操作的方法 ******************************/

    

    /****************************** 以下为字段的映射方法和格式化方法 ******************************/

    // Map method of field `charge_state`
    public static function getChargeStateMap($prepend = false)
    {
        $map = [
            self::CHARGE_STATE_WAIT => '待支付',
            self::CHARGE_STATE_PASS => '成功',
            self::CHARGE_STATE_FAIL => '失败',
        ];

        return self::resetMap($map, $prepend);
    }

    // Format method of field `charge_state`
    public function getChargeStateValue($value = null)
    {
        return $this->resetValue($value);
    }

    // Map method of field `charge_type`
    public static function getChargeTypeMap($prepend = false)
    {
        return Pay::getChargeTypeMap($prepend);
    }

    // Format method of field `charge_type`
    public function getChargeTypeValue($value = null)
    {
        return $this->resetValue($value);
    }
}
