module.exports = () => {
    // console.log({ NODE_ENV: process.env.NODE_ENV });
    if (process.env.NODE_ENV === "development")
      return process.env.REACT_APP_BASE_URL_DEV;
    if (process.env.NODE_ENV === "production")
      return process.env.REACT_APP_BASE_URL_PROD;
  };