import {configureStore} from "@reduxjs/toolkit";
import dashboardSlide from"./dashboard/dashboard"
import productSlide from"./product/product"
const store = configureStore({
  reducer: {
    dashboard: dashboardSlide,
    product: productSlide,
  },
});
export default store;