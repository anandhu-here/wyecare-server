const routes = [
    require('./auth/auth'),
    require('./shift'),
    require('./doc'),
    require('./test')

];


module.exports = function router(app, db){
    return routes.forEach(route=>{
        route(app, db);
    })
}