import React, { Component } from 'react';

class ReportPurchaseBySku extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/item/selectBiStorageSkuReportByGmtCreate`} width="100%" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportPurchaseBySku;
