const mongoose = require('mongoose');

const dotenv = require('dotenv');

const path = require('path');

const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../../config.env') });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB);

const Tour = require('../../model/tourmodel');
const User = require('../../model/userModel');
const Review = require('../../model/reviewModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

//TODO : import data into DB
const importDate = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Date Loaded Successfully');
  } catch (e) {
    console.log(e.message);
  }
  process.exit();
};

//TODO : Delete data From DB
const deleteDate = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Date Deleted Successfully');
  } catch (e) {
    console.log(e.message);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importDate();
} else if (process.argv[2] === '--delete') {
  deleteDate();
}
console.log(process.argv);
