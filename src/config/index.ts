import * as dotenv from 'dotenv';

dotenv.config();

export default {
  frontUrl: process.env.FRONT_URL,
  backUrl: process.env.BACK_URL,
  databaseURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,
  fcm: {
    enabled: process.env.FCM_ENABLED === 'true',
    serverKey: process.env.FCM_SERVER_KEY,
  },
  school: {
    multiSchool: process.env.SCHOOL_MULTISCHOOL,
    name: process.env.SCHOOL_NAME,
    city: process.env.SCHOOL_CITY,
  },
  lang: process.env.LANGUAGE,
  opinsys: {
    // Opinsys
    enabled: process.env.OPINSYS_ENABLED === 'true',
    organization: process.env.OPINSYS_ORGANIZATION,
    secret: process.env.OPINSYS_SECRET,
  },
};
