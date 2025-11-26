function test() 
{
    console.log("Test function executed.");
    return function inner()
    {
        console.log("Inner function executed.");
    }
}

const testFunction = test();
console.log(typeof testFunction); // Should log 'function'
testFunction(); // Should log "Inner function executed."