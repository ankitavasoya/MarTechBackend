import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import CustomerAddress from './customeraddress';
import CustomerProduct from './customer_product';
import MealDeliverySubscription from './mealdeliverysubscription';

interface CustomerAttributes {
  id?: string,
  name: string,
  first_name: string,
  last_name: string,
  email: string,
  country_code: string,
  mobile: string,
  full_mobile?: string,
  customer_from: string,
  company_id: string,
  is_deleted?: boolean,
  is_optout_from_campaign?: boolean, // for sms
  is_unsubscribe_from_campaign?: boolean; // for email
  customer_company_name?: string;
  customer_job_title?: string;
  tag_id?: string;


  // relations
  readonly customerAddress?: CustomerAddress;
  readonly mealDeliverySubscription?: MealDeliverySubscription;
}

export interface CustomerInput extends Optional<CustomerAttributes, 'id'> { }
export interface CustomerOuput extends Required<CustomerInput> { }

class Customer extends Model<CustomerAttributes, CustomerInput> implements CustomerAttributes {
  public id!: string;
  public first_name!: string;
  public last_name!: string;
  public name!: string;
  public email!: string;
  public country_code!: string;
  public mobile!: string;
  public customer_from!: string;
  public company_id!: string;
  public is_deleted!: boolean;
  public is_optout_from_campaign!: boolean; // for sms
  public is_unsubscribe_from_campaign!: boolean; // for email
  public customer_company_name!: string;
  public customer_job_title!: string;
  public tag_id!: string;

  public readonly full_mobile!: string;

  // relations
  public readonly customerAddress?: CustomerAddress;
  public readonly customerProduct?: CustomerProduct;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_mobile: {
      type: DataTypes.VIRTUAL,
      get() {
        const data = [];
        if (this.country_code) {
          data.push(this.country_code);
        }
        if (this.mobile) {
          data.push(this.mobile);
        }
        return data.join('');
      },
    },
    customer_from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_optout_from_campaign: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_unsubscribe_from_campaign: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tag_id: {
      type: DataTypes.UUID,
    },
    customer_company_name: {
      type: DataTypes.STRING,
    },
    customer_job_title: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Customer',
    tableName: 'customers',
  },
);

export default Customer;
