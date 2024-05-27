import axios from "axios";

// Setup axios with defaults
const request = axios.create({
  timeout: 30000
});

export default request;