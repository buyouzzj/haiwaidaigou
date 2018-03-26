import React, { Component } from 'react';

class ReportlogisticCompanyAvgPackage extends Component {
  render() {
    return (
      <div>
        <iframe src={`http://${location.host}/haierp1/bi/ship/selectShippingReportAvg`} width="960" height="1280" scrolling="yes" />
      </div>
    );
  }
}

export default ReportlogisticCompanyAvgPackage;
