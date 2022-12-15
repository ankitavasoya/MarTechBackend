require('dotenv').config();

module.exports = {
  'development': {
    'database': process.env.DB_NAME,
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASSWORD,
    'host': process.env.DB_HOSTNAME,
    'port': process.env.DB_PORT,
    'dialect': 'postgres',
    'dialectOptions': {
      'ssl': {
        'require': true,
        'rejectUnauthorized': false
      }
    }
  },
  'production': {
    'database': process.env.DB_NAME,
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASSWORD,
    'host': process.env.DB_HOSTNAME,
    'port': process.env.DB_PORT,
    'dialect': 'postgres',
    'dialectOptions': {
      'ssl': {
        'require': true,
        'rejectUnauthorized': false
      }
    }
  }
}