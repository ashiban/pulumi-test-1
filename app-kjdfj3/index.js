exports.handler = async (event) => {
    const name = event.path ? event.path.substring(1) : "Anonymous";
    return {msg: "hello world"}
};
