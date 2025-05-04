interface Config {
  api: {
    baseUrl: string;
    auth: string;
    timeRecords: string;
  };
  auth: {
    tokenExpiryAlertMinutes: number;
  };
}

const defaultConfig: Config = {
  api: {
    baseUrl: 'http://localhost:5100/api',
    auth: 'http://localhost:5100/api/auth',
    timeRecords: 'http://localhost:5100/api/time-records',
  },
  auth: {
    tokenExpiryAlertMinutes: 2,
  }
};

const config: Config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || defaultConfig.api.baseUrl,
    auth: process.env.REACT_APP_AUTH_API_URL || defaultConfig.api.auth,
    timeRecords: process.env.REACT_APP_TIME_RECORDS_API_URL || defaultConfig.api.timeRecords,
  },
  auth: {
    tokenExpiryAlertMinutes: process.env.REACT_APP_TOKEN_EXPIRY_ALERT_MINUTES 
      ? parseInt(process.env.REACT_APP_TOKEN_EXPIRY_ALERT_MINUTES) 
      : defaultConfig.auth.tokenExpiryAlertMinutes,
  }
};

export default config; 