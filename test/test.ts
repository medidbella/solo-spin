class MyClass {
    private name: string; // Soft private
    public printer!: () => void;

    constructor (name: string) { this.name = name; }
}
  
MyClass.prototype.printer = function() {
    // @ts-ignore: Required to bypass the compiler error
    console.log(this.name); 
};

const test: MyClass = new MyClass("karim");
test.printer();