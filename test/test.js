var MyClass = /** @class */ (function () {
    function MyClass(name) {
        this.name = "Example"; // Soft private
        this.name = name;
    }
    return MyClass;
}());
MyClass.prototype.printer = function () {
    // @ts-ignore: Required to bypass the compiler error
    console.log(this.name);
};
var test = new MyClass("karim");
test.printer();
