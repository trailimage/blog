import config from "../config";
import redis from "./redis";

export default redis.provide("map", config.cache.maps);