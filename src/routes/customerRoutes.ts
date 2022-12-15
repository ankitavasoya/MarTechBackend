import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';


import { CustomerController } from '../controllers/customers';
import { uploadFiles } from '../utils/file-utils';

const router = express.Router();

/**
 * Sending GET /list?[page=X][&[count=Y]][&driver=DRIVER][&name=NAME]
 * this route will skip ((X - 1)*Y) element and retrive Y element
 * this rotue will filter the customer table using the driver and the name.
 * */
router.get('/list', CheckAuth, CustomerController.listCustomers);
/**
 * sending a GET /info/X where X represent the id of the customer
 * will return the customer information
 */
router.get('/info/:id', CheckAuth, CustomerController.getCustomerInformation);

/**
 * sending a GET /info/X where X represent the id of the customer
 * will return the customer information
 */
router.get('/chats/:id', CheckAuth, CustomerController.getCustomersChats);
/**
 * sending a PUT /create with json body request
 * {name, email, mobile, customer_from, longitude, latitude,
 * address, city, zipCode, order_code, driver, order_startdate,
 * order_enddate, lunch_delivery, dinner_delivery,
 * rice_addon, order_quantity, remarks, order_price}
 * will create a new customer subscription
 */
router.put('/create', CheckAuth, CustomerController.createCustomer);
/**
 * sending a PATCH /X where X represent the id of the customer
 * will result in updating the fields you sent
 */
router.patch('/:id', CheckAuth, CustomerController.updateCustomerInformation);
/**
 * sending a DELETE request to the /remove path will result in deletin all the customers
 * in the array ids posted by the front application.
 */
router.delete(
  '/remove',
  CheckAuth,
  CustomerController.deleteCustomersSubscription,
);

router.post(
  '/upload',
  CheckAuth,
  uploadFiles.single('file'),
  CustomerController.uploadCSV
);

export default router;
