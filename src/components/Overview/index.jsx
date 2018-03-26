import React, { Component } from 'react';
import { Alert } from 'antd';

class Overview extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
      <Alert
        message="欢迎来到ERP管理系统"
        description="点击左侧目录进行管理操作。"
        type="info"
        showIcon
      />
    );
  }
}

export default Overview;
