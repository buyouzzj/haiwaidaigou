import React, { Component } from 'react';

class ReportSaleByDay extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/sale/selectSaleReportByGmtCreate`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportSaleByDay;
