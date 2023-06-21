const handler = async (event) => {
    try {
      switch (event.httpMethod) {
        case "GET":
          return handleGet(event);
        case "POST":
          return handlePost(event);
        case "OPTIONS":
          return handleOptions(event);
      }
    } catch (error) {
      return { statusCode: 500, body: error.toString() };
    }
  };
  
  function handleGet(event) {
    return {
      statusCode: 200,
      body: JSON.stringify({ dummyKey: `DummyGetVal` }),
      headers: {},
    };
  }
  
  function handlePost(event) {
    return {
      statusCode: 200,
      body: JSON.stringify({ dummyKey: `DummyPostVal` }),
      headers: {
        ...getCorsHeaders(),
      },
    };
  }
  
  function handleOptions(event) {
    return {
      statusCode: 200,
      headers: {
        ...getCorsHeaders(),
      },
    };
  }
  
  function getCorsHeaders() {
    return {
      "access-control-allow-methods": "POST,OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Max-Age": "2592000",
      "Access-Control-Allow-Credentials": "true",
    };
  }
  module.exports = { handler };