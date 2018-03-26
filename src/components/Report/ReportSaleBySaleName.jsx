import React, { Component } from 'react';

class ReportSaleBySaleName extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/ship/selectBiShipReportBySalesName`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportSaleBySaleName;
