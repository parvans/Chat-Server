import dotenv from 'dotenv';
dotenv.config();

let CONFIG = {};

CONFIG.port = process.env.PORT || 9000;

CONFIG.db_url = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';

CONFIG.dbCloud_url = process.env.MONGO_CLOUD_URI;

CONFIG.jwt_secret = process.env.JWT_SECRET || 'thisisasecretkey';

CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '30d';

CONFIG.encryptDecryptSecretKey = process.env.ENC_DEC_STR_SECRET_KEY; 

CONFIG.encryptDecryptSecretIv = process.env.ENC_DEC_STR_SECRET_IV;

CONFIG.encryptDecryptMethod = process.env.ENC_DEC_STR_ECNRYPTION_METHOD;

export default CONFIG;
