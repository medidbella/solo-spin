/* 
 block structure. 
 To keep things as simple as possible we include only the most necessary:
  index, timestamp, data, hash and previous hash.
*/

class Block{
    constructor (index, timestamp, data, hash, previousHash){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.previousHash = previousHash.toString();
    }
}

/* 
An arrow func that hash a Block uisng all of its data using SHA256 Encryption algorithm 
*/

var calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

