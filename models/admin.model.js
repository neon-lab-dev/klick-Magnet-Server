import { Schema, model } from "mongoose";

import { hash, compare } from "bcrypt";
import pkg from 'jsonwebtoken';
const { sign } = pkg;



const adminSchema = new Schema({
    full_name: {
        type: String,
        required: [true, "Please Enter Your full Name"],
        maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
        },
    },
    password: {
        type: String,
        required: [true, "Please Enter your password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
    },
});
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await hash(this.password, 10);
});
adminSchema.methods.getJWTToken = function () {
    return sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
adminSchema.methods.comparePassword = async function (enteredPassword) {
    return await compare(enteredPassword, this.password);
};
export default model("Admin", adminSchema);