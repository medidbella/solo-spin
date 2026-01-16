class Test {
    private static instance: Test;

    // 1️⃣ Prevent direct construction
    private constructor() {
        console.log("Instance Created");
    }

    // 2️⃣ Single access point
    public static getInstance(): Test {
        if (!Test.instance) {
            Test.instance = new Test();
        }
        return Test.instance;
    }
}

let tst1: Test = Test.getInstance();
let tst2: Test = Test.getInstance();