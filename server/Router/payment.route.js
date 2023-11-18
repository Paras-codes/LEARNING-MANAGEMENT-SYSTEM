import {Router} from "express"
import { allPayments, buySubscription, cancelSubscription, razorpayApikey, verifyPayment } from "../controller/paymentcontroler.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";


const router=Router();

// routes to be made 
//apikey->
// 1.subscribe-> 
// 2.verify
// as per user request other two routes
// 3.unsubscribe
// 4.all payments 


router
    .route("/rrazorPay-key")
    .get(isLoggedIn,razorpayApikey)

router
      .route("/subscribe")
      .post(isLoggedIn,buySubscription)

router
    .route("/verify")
    .post(isLoggedIn,verifyPayment)

router
    .route("/unsubscribe")
    .post(isLoggedIn,cancelSubscription)

router
    .route("/")
    .get(isLoggedIn,authorizedRoles('ADMIN'),allPayments)

export default router;