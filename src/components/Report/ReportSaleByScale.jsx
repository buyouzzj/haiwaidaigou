import React, { Component } from 'react';

class ReportSaleByScale extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/sale/selectSaleReportByScale`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportSaleByScale;
