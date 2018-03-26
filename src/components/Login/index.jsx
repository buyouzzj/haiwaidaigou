import React, { Component } from 'react';
import { Button, Row, Form, Input } from 'antd';
import { connect } from 'dva';
import logoImg from '../../assets/images/logo.png';
import styles from './style.less';

const FormItem = Form.Item;

class Login extends Component {
  constructor() {
    super();
    this.state = {
      loginButtonLoading: false,
    };
  }
  handleOk() {
    const p = this;
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
      p.submitLogin(values);
    });
  }
  submitLogin(payload) {
    this.props.dispatch({
      type: 'session/login',
      payload,
    });
  }
  render() {
    const { handleOk } = this;
    const { form } = this.props;
    const { loginButtonLoading } = this.state;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.form}>
        <div className={styles.logo}>
          <img role="presentation" src={logoImg} />
        </div>
        <form>
          <FormItem hasFeedback>
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  message: '请填写用户名',
                },
              ],
            })(<Input size="large" onPressEnter={handleOk.bind(this)} placeholder="用户名" />)}
          </FormItem>
          <FormItem hasFeedback>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请填写密码',
                },
              ],
            })(<Input size="large" type="password" onPressEnter={handleOk.bind(this)} placeholder="密码" />)}
          </FormItem>
          <Row>
            <Button type="primary" size="large" onClick={handleOk.bind(this)} loading={loginButtonLoading}>
              登录
            </Button>
          </Row>
          <p>爱如花科技 版权所有</p>
        </form>
      </div>
    );
  }
}

function mapStateToProps({ session }) {
  return { session };
}

export default connect(mapStateToProps)(Form.create()(Login));
