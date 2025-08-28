import { connect } from "mongoose";

const connectDB = () => {
    connect(process.env.MONGO_URI)
        .then((data) => {
            console.log(`MongoDb connected with server: ${data.connection.host}`);
        });
};

export default connectDB;