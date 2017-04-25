export interface Redis {
   /**
    * Removes the specified keys. A key is ignored if it does not exist.
    * @see http://redis.io/commands/del
    */
   del(key: string|string[], callback: (result: number) => any): void;

   /**
    * Removes the specified fields from the hash stored at key. Specified fields that
    * do not exist within this hash are ignored. If key does not exist, it is treated
    * as an empty hash and this command returns 0.
    * @see http://redis.io/commands/hdel
    * @see https://github.com/mranney/node_redis/issues/369
    */
   hdel(key: string|string[], hashKey: string|string[], callback: (result: number) => any): void;

   /**
    * @see http://redis.io/commands/exists
    */
   exists(key: string, callback: (result: number) => any): void;

   /**
    * Returns if field is an existing field in the hash stored at key
    * @see http://redis.io/commands/hexists
    */
   hexists(key: string, hashKey: string, callback: (result: number) => any): void;

   /**
    * Returns all keys matching pattern
    * @see http://redis.io/commands/keys
    */
   keys(pattern: string, callback: (result: string[]) => any): void;

   /**
    * Returns all hash keys matching pattern
    * @see http://redis.io/commands/hkeys
    */
   hkeys(pattern: string, callback: (result: string[]) => any): void;

   /**
    * Returns the value associated with the key
    * @see http://redis.io/commands/get
    */
   get(key: string, callback: (result: string) => any): void;

   /**
    * Returns the value associated with field in the hash stored at key
    * @see http://redis.io/commands/hget
    */
   hget(key: string, hashKey: string, callback: (result: string) => any): void;

   /**
    * Returns all fields and values of the hash stored at key
    * @see http://redis.io/commands/hgetall
    * @see https://github.com/mranney/node_redis#clienthgetallhash
    */
   hgetall(key: string, callback: (result: Object) => any): void;

   /**
    * Set key to hold the string value. If key already holds a value, it is overwritten,
    * regardless of its type.
    * @see http://redis.io/commands/set
    */
   set(key: string, value: string): void;

   /**
    * Sets field in the hash stored at key to value. If key does not exist, a new key holding
    * a hash is created. If field already exists in the hash, it is overwritten.
    * @see http://redis.io/commands/hset
    */
   hset(key: string, hashKey: string, value: string, callback?: (result: Object|string|boolean) => any): void;

   /**
    * Sets the specified fields to their respective values in the hash stored at key.
    * This command overwrites any existing fields in the hash. If key does not exist,
    * a new key holding a hash is created.
    * @see http://redis.io/commands/hset
    * @see https://github.com/mranney/node_redis#clienthmsethash-obj-callback
    */
   hmset(key: string, hash: Object): void;
}