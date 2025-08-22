import mongoose from 'mongoose'
import { db_name } from '../constanst.js'

const connectDatabase = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${db_name}`)
        console.log(`Database connected!! ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error: ",error)
    }
}

export { connectDatabase }