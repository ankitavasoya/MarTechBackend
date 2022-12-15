import { v4 as uuidv4 } from 'uuid';
import { FindOptions, Op } from 'sequelize';
import { NextFunction, Response } from 'express';
import * as excel from 'exceljs';
import { promisify } from 'util';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import * as _ from 'lodash';

import { AppRequest } from '../utils/interface';

import { Models } from '../db/models';
import catchAsync from '../utils/catchAsync';
import * as Utils from '../utils/common';
import AppError from '../utils/appError';
import customerCSVQueue from '../bull-queue/queues/customer-add.queue';
import { JOB_NAMES } from '../bull-queue/helpers/constants';
import { MAX_CUSTOMER_CSV_ALLOWED } from '../utils/constants';
import { UserInput } from '../db/models/user';

const unlinkAsync = promisify(fs.unlink);

/**
 * this function will handle the request to create a new customer subscription
 */
const createCustomer = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const {
    name,
    mobile,
    customer_from,
    country_code,
    longitude,
    latitude,
    address,
    city,
    zipCode,
    order_code,
    remarks,
    tag_id
  } = req.body;
  
  //TODO: CHECK THE REQUIRED FIELD
  const name_arr = _.split(name, ' ');
  const customer = await Models.Customer.create({
    id: uuidv4(),
    name,
    first_name: name_arr.length ? name_arr[0] : '',
    last_name: name_arr.length ? name_arr[1] : '',
    email: '',
    mobile,
    customer_from,
    country_code,
    company_id: req.user.company_id,
    tag_id: tag_id
  });
  const customerAddress = await Models.CustomerAddress.create({
    id: uuidv4(),
    address,
    city,
    zipCode,
    customer_id: customer.id,
    longitude,
    latitude,
  });
  const customerProduct = await Models.CustomerProduct.create(
    {
      id: uuidv4(),
      order_code,
      product_name: '',
      sales_amount: 0,
      remarks,
      customer_id: customer.id,
    },
  );
  return res.status(200).json({
    error: false,
    message: 'customer create successfully',
    customer,
    customerAddress,
    customerProduct,
  });
});

const getCustomersData = async (query: {
  page: string | number,
  count: string | number,
  filters: any,
  attributes?: string[],
  companyId: string,
}) => {
  const { page, count, filters, attributes, companyId } = query; //extract the page and number of element per page, driver and name filter from the url
  const pageNumber = page && parseInt(page.toString()) >= 0 ? parseInt(page.toString()) : 0;
  const data = Utils.getPagination(pageNumber, count ? parseInt(count.toString()) : 20);
  const filterCustomer: any = Utils.getQueryBuilder(filters);
  if (companyId) {
    filterCustomer.company_id = companyId;
  }
  filterCustomer.is_deleted = false;
  const modelObject: FindOptions = {
    where: filterCustomer,
    limit: data.limit,
    offset: data.offset,
    order: [['createdAt', 'desc']],
    include: [
      {
        model: Models.CustomerAddress,
        as: 'customerAddress',
      },
    ],
  };
  if (attributes && attributes.length) {
    modelObject.attributes = attributes;
  }
  return Promise.all([
    Models.Customer.findAll(modelObject),
    Models.Customer.count({
      where: filterCustomer,
    }),
  ]);
}

/**
 * this function will handle the request to retrieve and filter the list of customers subscription
 */
const listCustomers = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const [customers, total] = await getCustomersData({
    page: req.query.page.toString(),
    count: req.query.count.toString(),
    filters: req.query.filters,
    companyId: req.user.company_id
  });
  return res.status(200).json({ total, customers });
});

/**
 * this function will handle the request to get the information of a specific customer subscription
 */
const getCustomerInformation = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { id } = req.params; //extract the id from the url
  const customer = await Models.Customer.findOne({
    where: { id },
    include: [
      {
        model: Models.CustomerProduct,
        as: 'customerProduct',
      },
      { model: Models.CustomerAddress, as: 'customerAddress' },
    ],
  });
  // if the customer exist
  if (customer) {
    //return the customer information
    return res.status(200).json(customer);
  }
  //raise error 404
  return res.status(404).json({ error: true, message: 'Element not found' });
});

/**
 * this function will handle the update customer information process.
 */
const updateCustomerInformation = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { id } = req.params; // extract the id from the url.
  const {
    name,
    mobile,
    customer_from,
    country_code,
    longitude,
    latitude,
    address,
    city,
    zipCode,
    order_code,
    remarks,
  } = req.body; //extract the information sent by the user.
  const customer = await Models.Customer.findOne({
    where: { id },
    include: [
      {
        model: Models.CustomerProduct,
        as: 'customerProduct',
      },
      { model: Models.CustomerAddress, as: 'customerAddress' },
    ],
  });

  // if the customer exist
  if (customer) {
    if (name) customer.name = name; // if the user sent a new name we register it for the update
    if (mobile) customer.mobile = mobile;
    if (country_code) customer.country_code = country_code;
    if (customer_from) customer.customer_from = customer_from;

    await customer.save(); // execute the update query.

    if (address) customer.customerAddress.address = address;
    if (city) customer.customerAddress.city = city;
    if (zipCode) customer.customerAddress.zipCode = zipCode;
    await customer.customerAddress.save(); // execute  the update query of the customer Address

    if (order_code) customer.customerProduct.order_code = order_code;
    if (remarks) customer.customerProduct.remarks = remarks;

    await customer.customerProduct.save(); // execute the update query of the meal delivery subscription table

    return res.status(200).json({
      erorr: false,
      message: 'Customer information updated successfully',
    });
  }
  //raise error 404
  return res.status(404).json({ error: true, message: 'Element not found' });
});

/**
 * this function will delete a specific or bulk customers
 */
const deleteCustomersSubscription = async (req: AppRequest, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  for (const id of ids) {
    const customer = await Models.Customer.findOne({
      where: { id },
      include: [
        {
          model: Models.CustomerProduct,
          as: 'customerProduct',
        },
        { model: Models.CustomerAddress, as: 'customerAddress' },
      ],
    });
    if (customer) {
      customer.customerProduct && await customer.customerProduct.destroy();
      customer.customerAddress && await customer.customerAddress.destroy();
      customer.is_deleted = true;
      await customer.save();
    }
  }
  return res
    .status(200)
    .json({ error: false, message: 'customers has been removed' });
};

/**
 * this function will handle the request to get the information of a specific customer chats
 */
const getCustomersChats = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // extract the id from the url
    const customer = await Models.Customer.findOne({
      where: { id },
      attributes: ['id', 'name', 'country_code', 'mobile', 'full_mobile'],
    });
    const customerRaw: any = customer.toJSON();
    // if the customer exist
    if (customerRaw) {
      const chats = await Models.Message.findAll({
        where: {
          [Op.or]: [
            {
              from_customer_id: id,
            },
            {
              to_customer_id: id,
            },
          ],
        },
        include: [
          {
            model: Models.User,
            as: 'users',
            attributes: ['name'],
          },
        ],
      });
      customerRaw.chats = chats;
    }
    return res.status(200).send(customerRaw);
  } catch (e) {
    return next(e);
  }
});

/**
 * this function will upload the csv and add customers
 */
const uploadCSV = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a csv file', 400));
    }
    if (!Utils.isUUID(req.body.tag_id)) {
      return next(new AppError('Please provide select a tag!', 400));
    }
    const file = req.file;
    // const workbook = new excel.Workbook();
    // read file
    // const worksheet = await workbook.csv.readFile(file.path);
    const customers = await csv().fromFile(file.path);
    // delete file from temp after reading
    await unlinkAsync(file.path);

    if (customers.length > MAX_CUSTOMER_CSV_ALLOWED) {
      return next(new AppError(`Only ${MAX_CUSTOMER_CSV_ALLOWED.toLocaleString()} customers are allowed in a single csv file!`, 400));
    }

    // now we will send this in queue which will process the csv
    customerCSVQueue.add(JOB_NAMES.CUSTOMER.ADD, {
      customers,
      companyId: req.user.company_id,
      tagId: req.body.tag_id
    });
    return res.status(200).send({});
  } catch (e) {
    return next(e);
  }
});

export const CustomerController = {
  createCustomer,
  listCustomers,
  getCustomerInformation,
  updateCustomerInformation,
  deleteCustomersSubscription,
  getCustomersChats,
  getCustomersData,
  uploadCSV,
};