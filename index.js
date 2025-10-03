require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectdb = require("./src/database/db.js")
const userRouter = require("./src/routes/user.route.js");


// Enable CORS
app.use(cors({
  origin: ["http://localhost:8081", "https://digitalcampus01.netlify.app"],  // Replace with your deployed frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


//Routes
app.use("/api/users", userRouter);


app.get("/hello",(req,res)=>{
    res.json({message:"Server is Successfully Deployed!!!"})
})

connectdb()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`🗄️  Server is running on Port: ${process.env.PORT}`);
    })
})
.catch((err) => {
   console.log("MongoDB Connection Failed" , err)
})