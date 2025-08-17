//make me a call back function
function greet(name){
    console.log("in side greet function ! ")

    name();

}


function name(){
    console.log("im just a normal function but running inside a callback function !")
}
greet(name);