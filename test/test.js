var Test = /** @class */ (function () {
    // 1️⃣ Prevent direct construction
    function Test() {
        console.log("Instance Created");
    }
    // 2️⃣ Single access point
    Test.getInstance = function () {
        if (!Test.instance) {
            Test.instance = new Test();
        }
        return Test.instance;
    };
    return Test;
}());
var tst1 = Test.getInstance();
var tst2 = Test.getInstance();
