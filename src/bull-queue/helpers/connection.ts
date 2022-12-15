export default {
  port: (process.env.REDIS_PORT || 6379) as number,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
}