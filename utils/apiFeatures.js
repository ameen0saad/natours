class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filtering
  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const excludedFields = ['fields', 'limit', 'page', 'sort'];
    excludedFields.forEach((e) => delete queryObj[e]);
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    const reg = /\b(gte|gt|lte|lt)\b/gi;
    queryStr = queryStr.replace(reg, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  //Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  //limitFields
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  //pagination
  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //     const numTour = await this.query.countDocuments()
    //     if (numTour <= skip) throw new Error('invalid ')
    // }
    return this;
  }
}
module.exports = APIFeatures;
