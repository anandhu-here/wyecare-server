const routes = [
    require('./auth/auth'),
    require('./shift'),
    require('./doc'),
    require('./test'),
    require('./fcm')

];


module.exports = function router(app, db){
    return routes.forEach(route=>{
        route(app, db);
    })
}