import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import axios from "axios";

import { config } from "./config/index.js";
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: config.groqApiKey
});

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const AXIOS_TIMEOUT = 10000;

const tools = [
    {
    type: "function",
    function: {
        name: "searchProducts",
        description:
            "Tìm kiếm sản phẩm trong cửa hàng theo từ khóa, giá, thương hiệu, màu sắc, size.",

        parameters: {
            type: "object",

            properties: {

                keyword: {
                    type: "string",
                    description:
                        "Tên sản phẩm hoặc từ khóa tìm kiếm. Chỉ gửi khi người dùng có yêu cầu."
                },

                categoryId: {
                    type: "integer",
                    description:
                        "ID danh mục sản phẩm."
                },

                brand: {
                    type: "string",
                    description:
                        "Thương hiệu sản phẩm."
                },
                sort:{
 type:"string",
 description:"Sắp xếp sản phẩm. price_desc là giá cao nhất, price_asc là giá thấp nhất"
},

                color: {
                    type: "string",
                    description:
                        "Màu sản phẩm."
                },

                size: {
                    type: "string",
                    description:
                        "Kích thước sản phẩm."
                },

               maxPrice: {
    type: ["number", "string"],
    description: "Giá tối đa"
},

minPrice: {
    type: ["number", "string"],
    description: "Giá tối thiểu"
},

limit: {
    type: ["integer", "string"],
    description: "Số lượng sản phẩm"
}

            },

            required: [
                "limit"
            ]
        }
    }
},

    {
        type: "function",
        function: {
            name: "addToCart",

            description: "Thêm sản phẩm vào giỏ hàng.",

            parameters: {

                type: "object",

                properties: {

                    productSizeId: {
                        type: "number"
                    },

                    quantity: {
                        type: "number"
                    }

                },

                required: [
                    "productSizeId",
                    "quantity"
                ]
            }
        }
    },

    {
    type:"function",

    function:{
        name:"getUserOrders",

        description:
        "Lấy danh sách đơn hàng và chi tiết đơn hàng của người dùng hiện tại.",

        parameters:{
            type:"object",

            additionalProperties:false,

            properties:{}
        }
    }
},
{
    type:"function",

    function:{
        name:"getOrderDetail",

        description:
        "Lấy chi tiết sản phẩm trong một đơn hàng dựa vào mã đơn.",

        parameters:{
            type:"object",

            additionalProperties:false,

            properties:{
                orderCode:{
                    type:"string",
                    description:"Mã đơn hàng cần xem chi tiết"
                }
            },

            required:[
                "orderCode"
            ]
        }
    }
}

];

async function callGroqWithRetry(messages, opts = {}) {

    let { retries = 1, temperature = 0.2 } = opts;

    for (let attempt = 0; attempt <= retries; attempt++) {

        try {

            const response = await groq.chat.completions.create({

                model: config.groqModel,

                messages,

                tools,

                tool_choice: "auto",

                parallel_tool_calls: false,

                temperature

            });

            return response;

        } catch (err) {

            const isToolUseFailed =
                err?.error?.error?.code === "tool_use_failed" ||
                err?.status === 400;

            console.error(
                `Groq call attempt ${attempt + 1} failed:`,
                err?.error?.error?.failed_generation || err.message
            );

            if (isToolUseFailed && attempt < retries) {

                temperature = Math.max(0, temperature - 0.1);

                continue;

            }

            throw err;

        }

    }

}

// Bắt các biến thể fake function-call mà model có thể viết trong content thay vì gọi tool thật:
// 1) <function>name</function>{...}
// 2) <function=name({...})> hoặc <function=name/>{...}
function extractFakeFunctionCall(content) {

    if (!content) return null;

    let match = content.match(/<function>(.*?)<\/function>\s*(\{.*\})/s);

    if (match) {
        return { name: match[1].trim(), args: match[2] };
    }

    match = content.match(/<function=([a-zA-Z0-9_]+)\s*\(?\s*(\{.*?\})?\s*\)?\s*\/?>/s);

    if (match) {

        if (match[2]) {
            return { name: match[1].trim(), args: match[2] };
        }

        const afterTag = content.slice(content.indexOf(match[0]) + match[0].length);
        const argsMatch = afterTag.match(/\{.*\}/s);

        return { name: match[1].trim(), args: argsMatch ? argsMatch[0] : "{}" };

    }

    return null;

}

function sanitizeParams(params = {}) {

    const cleaned = {};

    Object.entries(params).forEach(([key, value]) => {

        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "null"
        ) {

            cleaned[key] = value;

        }

    });

    if(cleaned.limit){
    cleaned.limit = parseInt(cleaned.limit);
}else{
    cleaned.limit = DEFAULT_LIMIT;
}


if(isNaN(cleaned.limit)){
    cleaned.limit = DEFAULT_LIMIT;
}

    if (cleaned.limit < 1) {

        cleaned.limit = DEFAULT_LIMIT;

    }

    if (cleaned.limit > MAX_LIMIT) {

        cleaned.limit = MAX_LIMIT;

    }

    return cleaned;

}

app.post("/api/chat", async (req, res) => {

    const {

        message,
        userToken

    } = req.body;

    try {

        let response;

        try {

            response = await callGroqWithRetry(
                [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                { retries: 1, temperature: 0.2 }
            );

        } catch (err) {

            const isToolUseFailed =
                err?.error?.error?.code === "tool_use_failed";

            if (!isToolUseFailed) {

                // Lỗi khác (429 rate limit, 500, network...) -> để catch tổng bên ngoài xử lý đúng loại
                throw err;

            }

            console.error(
                "Tool use failed after retry:",
                err?.error?.error?.failed_generation || err.message
            );

            return res.json({

                success: true,

                message:
                    "Cậu nói lại giúp tớ rõ hơn được không? Ví dụ cậu muốn tìm sản phẩm gì, hay xem đơn hàng nào nha 🌸"

            });

        }

        const responseMessage = response.choices?.[0]?.message;

        let toolCall = responseMessage?.tool_calls?.[0];

// xử lý trường hợp Groq trả function call dạng text thay vì tool_calls chuẩn
const fakeCall = !toolCall ? extractFakeFunctionCall(responseMessage?.content) : null;

if (fakeCall) {

    // Không dùng phần text model viết vì có thể chứa dữ liệu bịa (số tiền, mã đơn...)
    // Chỉ lấy tên hàm + args để gọi tool thật, dữ liệu trả về user lấy từ backend thật.
    toolCall = {

        id: "manual_tool_call",

        function: {

            name: fakeCall.name,

            arguments: fakeCall.args

        }

    };

}

// Nếu model cố gắng gọi function trong text nhưng format lỗi tới mức không parse được
// -> không trả nội dung đó cho user (có thể chứa data bịa), trả fallback an toàn.
const looksLikeBrokenFunctionCall =
    !toolCall && responseMessage?.content?.includes("<function");

if (looksLikeBrokenFunctionCall) {

    console.error("Broken function-call format, raw content:", responseMessage.content);

    return res.json({

        success: true,

        message: "Cậu đợi tớ xíu, cậu gõ lại câu hỏi giúp tớ nha 🌸"

    });

}

if (!toolCall) {

    return res.json({

        success:true,

        message:responseMessage.content

    });

}

        let functionArgs = {};

        try {

            functionArgs = JSON.parse(toolCall.function.arguments);

        } catch (err) {

            console.error("Parse Tool Error:", err);

            return res.status(400).json({

                success: false,

                message: "Tớ chưa hiểu yêu cầu của cậu 🌸"

            });

        }

        const functionName = toolCall.function.name;

        const headers = userToken
            ? {
                Authorization: `Bearer ${userToken}`
            }
            : {};

        let actionResult = null;

        switch (functionName) {
            case "getOrderDetail": {


    if(!userToken){

        actionResult =
        "Cậu cần đăng nhập để xem đơn hàng nha 🌸";

        break;

    }

    const orderCode = functionArgs.orderCode || functionArgs.orderId;

    if (!orderCode) {

        actionResult =
        "Cậu cho tớ xin mã đơn hàng cụ thể để tớ xem chi tiết nha 🌸";

        break;

    }

    try{


        const backendRes =
        await axios.get(

            `${config.backendUrl}/orders/detail/${orderCode}`,

            {
                headers,
                timeout:AXIOS_TIMEOUT
            }

        );


        actionResult =
        backendRes.data.data ||
        backendRes.data;


    }catch(err){

        console.error(
            "Order Detail Error:",
            err.message
        );


        actionResult =
        "Không tìm thấy chi tiết đơn hàng 🌸";

    }


    break;

}

            case "searchProducts": {

                const params = sanitizeParams(functionArgs);

                try {

                    console.log("Search Params:", params);

                    const backendRes = await axios.get(

                        `${config.backendUrl}/products`,

                        {

                            params,

                            timeout: AXIOS_TIMEOUT

                        }

                    );

                    let products =
                        backendRes.data.data ||
                        backendRes.data ||
                        [];

                    if (!Array.isArray(products)) {

                        products = [];

                    }

                    products = products.slice(0, params.limit);

                    actionResult =
                        products.length > 0
                            ? products
                            : [];

                } catch (err) {

                    console.error("Search Error:", err.message);

                    actionResult = [];

                }

                break;

            }            case "addToCart": {

                if (!userToken) {

                    actionResult =
                        "Cậu cần đăng nhập trước để thêm sản phẩm vào giỏ nha 🌸";

                    break;

                }

                try {

                    await axios.post(

                        `${config.backendUrl}/cart/items`,

                        functionArgs,

                        {

                            headers,

                            timeout: AXIOS_TIMEOUT

                        }

                    );

                    actionResult =
                        "Đã thêm sản phẩm vào giỏ hàng thành công 🌸";

                } catch (err) {

                    console.error("Add Cart Error:", err.message);

                    actionResult =
                        "Tớ chưa thể thêm sản phẩm vào giỏ lúc này 😥";

                }

                break;

            }

            case "getUserOrders": {

                if (!userToken) {

                    actionResult =
                        "Cậu cần đăng nhập để xem đơn hàng nha 🌸";

                    break;

                }

                try {

                    const backendRes = await axios.get(

                        `${config.backendUrl}/orders`,

                        {

                            headers,

                            timeout: AXIOS_TIMEOUT

                        }

                    );

                    actionResult =
                        backendRes.data.data ||
                        [];

                } catch (err) {

                    console.error("Order Error:", err.message);

                    actionResult = [];

                }

                break;

            }

            default:

                actionResult =
                    "Tớ chưa hỗ trợ chức năng này 🌸";

        }

        const toolMessage = {

            role: "tool",

            tool_call_id: toolCall.id,

            content: JSON.stringify(actionResult)

        };

        const finalResponse = await groq.chat.completions.create({

            model: config.groqModel,

            temperature: 0.2,

            messages: [

                {

                    role: "system",

                    content: SYSTEM_PROMPT

                },

                {

                    role: "user",

                    content: message

                },

                responseMessage,

                toolMessage

            ]

        });

        return res.json({

            success: true,

            message:
                finalResponse.choices?.[0]?.message?.content ||
                "Xin lỗi, tớ chưa có câu trả lời 🌸"

        });

    } catch (err) {

        console.error("================================");
        console.error("CHATBOT ERROR");
        console.error(err);
        console.error("================================");

        if (err?.status === 429 || err?.error?.error?.code === "rate_limit_exceeded") {

            const retryAfter = err?.headers?.get?.("retry-after");

            return res.status(429).json({

                success: false,

                message:
                    "Tớ đang hơi quá tải, cậu chờ tớ một chút rồi hỏi lại nha 🌸" +
                    (retryAfter ? ` (khoảng ${Math.ceil(retryAfter / 60)} phút nữa)` : "")

            });

        }

        return res.status(500).json({

            success: false,

            message:
                "Úi, tớ gặp chút sự cố khi xử lý yêu cầu 😥"

        });

    }

});

app.listen(config.port, () => {

    console.log(
        `🌸 Chatbot Service đang chạy tại port ${config.port}`
    );

});