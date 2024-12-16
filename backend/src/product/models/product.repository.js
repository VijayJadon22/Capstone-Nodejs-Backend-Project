import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (data) => {
    return await new ProductModel(data).save();
};

export const getAllProductsRepo = async (queryParams) => {
    try {
        // 1. Create a copy of queryParams to modify for filtering
        const queryObj = { ...queryParams };

        // Fields that should be excluded from the main query
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]); //deleting the above fields from queryObj 

        // 2. Implement search functionality
        if (queryParams.keyword) {
            queryObj.name = { $regex: queryParams.keyword, $options: 'i' }; // Case-insensitive search
            delete queryObj.keyword; // Remove keyword field as it's no longer needed
        }

        // 3. Implement filtration: Convert to string and replace comparison operators
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Parse back to JSON and construct query
        let query = await ProductModel.find(JSON.parse(queryStr));

        // 4. Implement sorting based on provided sort criteria
        if (queryParams.sort) {
            const sortBy = queryParams.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // Default sorting by createdAt in descending order
        }

        // 5. Implement field limiting based on provided fields
        if (queryParams.fields) {
            const fields = queryParams.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v'); // Default to exclude the __v field
        }

        // 6. Implement pagination based on provided page and limit
        const page = queryParams.page * 1 || 1; //This converts the page value from a string to a number
        const limit = queryParams.limit * 1 || 10; //This converts the limit value from a string to a number

        const skip = (page - 1) * limit; /*eg:- If page = 2 and limit = 10, the calculation is (2 - 1) * 10 = 10, meaning it skips the first 10 documents to start from the 11th document*/

        query = query.skip(skip).limit(limit); /*.skip(skip): Skips the first skip number of documents.
        .limit(limit): Limits the number of documents returned to limit*/

        // Check if the requested page exists
        if (queryParams.page) {
            const numProducts = await ProductModel.countDocuments();
            if (skip >= numProducts) throw new Error('This page does not exist');
        }

        // 7. Execute query to get the products
        const products = await query; // Await the query execution

        return products;
    } catch (error) {
        // 8. Error handling
        throw new Error(error.message || 'Internal Server Error');
    }
};

export const updateProductRepo = async (_id, data) => {
    return await ProductModel.findByIdAndUpdate(
        _id,
        data,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );
};

export const deleteProductRepo = async (_id) => {
    return await ProductModel.findByIdAndDelete(_id);
};

export const getProductDetailsRepo = async (_id) => {
    return await ProductModel.findById(_id);
};

export const findProductRepo = async (productId) => {
    return await ProductModel.findById(productId);
};



