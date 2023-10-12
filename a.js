var a = [1,2,3,4]
var b = [2,3]
b = new Set(b);

c = a.filter(i=>!b.has(i))

console.log(c)