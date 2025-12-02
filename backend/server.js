import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import DBConnection from "./config/database.js";
import swaggerUI from 'swagger-ui-express';
import swaggerDocumentation from './swagger.json' with {type: 'json'};
import kingdomRouter from "./routes/kingdomRoute.js"; 
import taxonomyRouter from "./routes/taxonomyRoute.js"; 
import habitatRouter from "./routes/habitatRoute.js"; 
import specieRouter from "./routes/specieRoute.js"; 
import humanRiskRouter from "./routes/human_riskRoute.js";

dotenv.config();
DBConnection();

const app = express();

app.use(cors());
app.use(express.json())

app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));


app.use("/api/kingdom", kingdomRouter);
app.use("/api/taxonomy", taxonomyRouter);
app.use("/api/habitat", habitatRouter);
app.use("/api/specie", specieRouter);
app.use("/api/human_risk", humanRiskRouter);

app.listen(3000, ()=>{
    console.log("server http://localhost:3000");
});