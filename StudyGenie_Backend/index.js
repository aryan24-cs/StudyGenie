import { app } from "./app.js"
import './db/index.js'
import dotenv from 'dotenv'
import { connectDatabase } from "./db/index.js"


dotenv.config({
    path:"./env"
})

connectDatabase().then(()=>{
    app.listen(process.env.PORT || 8080,()=>{
        console.log(`server is LIVE !! on ${process.env.PORT}`)
    })
}).catch(()=>{
    console.log("error: " ,error)
})

