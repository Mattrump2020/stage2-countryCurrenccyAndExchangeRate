import mongoose from "mongoose";
import 'dotenv/config'


function connectMongoDb (){
    const mongodb_connection = process.env.MONGODB_CONNECTION
    if (!mongodb_connection)// for if connection string is missing in dotenv
        throw new Error ("MongoDB connection string is missing in environment variables")

    try{

        mongoose.connect(mongodb_connection);
    
        mongoose.connection.on("connected", (req, res)=>{
            console.log("MongoDb connected successfully...")
        })
    
        mongoose.connection.on("disconnected", (req, res)=>{
            console.log("MongoDb disconnected...")
        })

        mongoose.connection.on("error", (err) =>{
            console.error("MongoDb connetion error:", err.message)
             // Optional: retry logic or alerting can go here
        })
    }
    catch (error){
        console.error("Failed to initialize MongoDb connection: ", error.message )
    }
}
export default connectMongoDb;