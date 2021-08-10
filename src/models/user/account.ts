import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

interface Account extends mongoose.Document {
  firstName: string;
  lastName: string;
  role: number;
  store: {
    [key: string]: any;
  };
  roleStore: {
    [key: string]: any;
  };
}

const account = new mongoose.Schema<Account>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  store: {
    // Modules can write data to their own store section (for storing account specific data)
    type: Object,
    default: {},
  },
  roleStore: {
    // Modules can write data to their own store section (for storing role specific data). This gets wiped if user role changes
    type: Object,
    default: {},
  },
});

account.plugin(uniqueValidator);

export default mongoose.model<Account>('Account', account);
