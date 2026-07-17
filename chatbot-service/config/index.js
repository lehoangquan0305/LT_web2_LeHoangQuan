import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 5005,

    groqApiKey: process.env.GROQ_API_KEY,

    groqModel:
        process.env.GROQ_MODEL || "llama-3.3-70b-versatile",temperature: 0.1,

    backendUrl:
        process.env.BACKEND_URL || "http://localhost:8080/api"
        
};