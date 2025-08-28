class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // search() {
    //     const { title, category, subcategory, tags } = this.queryStr;
    //     const searchQuery = {};

    //     // Handle title search
    //     if (title) {
    //         searchQuery.title = {
    //             $regex: title,
    //             $options: "i",  // Case-insensitive search
    //         };
    //     }

    //     // Handle category search with populated field
    //     if (typeof category === 'string' && category.trim() !== '') {
    //         searchQuery["category.name"] = {
    //             $eq: category,
    //         };
    //     }

    //     // Handle subcategory search
    //     if (subcategory) {
    //         searchQuery.subCategory = {
    //             $regex: subcategory,
    //             $options: "i",  // Case-insensitive search
    //         };
    //     }

    //     // Handle tags search
    //     if (tags) {
    //         searchQuery.tags = {
    //             $in: tags.split(',').map(tag => new RegExp(tag.trim(), 'i'))
    //         };
    //     }

    //     console.log("Search Query:", searchQuery); // Debugging to check the search query

    //     this.query = this.query.find(searchQuery);
    //     console.log("Query:", this.query); // Debugging to check the query
    //     return this;
    // }
    search() {
        const { title, category, subcategory, tags } = this.queryStr;
        const searchQuery = {};

        // Handle title search
        if (title) {
            searchQuery.title = {
                $regex: title,
                $options: "i",  // Case-insensitive search
            };
        }

        // Handle category search with populated field
        if (typeof category === 'string' && category.trim() !== '') {
            searchQuery["category.name"] = {
                $eq: category,
            };
        }

        // Handle subcategory search
        if (typeof subcategory === 'string' && subcategory.trim() !== '') {
            searchQuery.subCategory = {
                $regex: subcategory,
                $options: "i",  // Case-insensitive search
            };
        }

        // Handle tags search
        if (typeof tags === 'string' && tags.trim() !== '') {
            searchQuery.tags = {
                $in: tags.split(',').map(tag => tag.trim())
            };
        }


        this.query = this.query.find(searchQuery);
        return this;
    }
    filter() {
        const queryCopy = { ...this.queryStr };

        // Remove fields from query that shouldn't be in the final filter
        const removeFields = ["title", "category", "subcategory", "tags", "page", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

export default ApiFeatures;
