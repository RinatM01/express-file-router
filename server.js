import express from 'express';
import fs from 'fs';
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const ROOT = './router/';

async function handleStaticRoute(fileRoute, req, res) {
    try {
        const module = await import(fileRoute);
        let data = null;
        // if file has multiple methods we want to call them accordingly
        const routeMethod = req.method.toLowerCase();
        if (module[routeMethod]) {
            data = module[routeMethod](req,res)
        } else {
            data = module.handler(req,res);
        }
        return data;
    } catch (err) {
        res.statusCode = 404;
        return false
    }
}

async function handleDynamicRoute (fileRoute,req,res) {
    let route = fileRoute.split("/");
    let dynamicArg = route.pop()
    let dynamicDir = route.join("/");
    const dirs = await fs.promises.readdir(dynamicDir);
    try {
        const dynamicFileName = dirs.find(name => {
            return name.match(/\[[a-zA-Z0-9\._]+\]/);
        });
        const dynamicParam = dynamicFileName.replace("[","").replace("].js","");
        req.params = {...req.params, [dynamicParam] : dynamicArg}
        const data = await handleStaticRoute(dynamicDir + `/${dirs[0]}`,req,res);
        return data;
    } catch (err) {
        res.statusCode = 404;
        return false
    }
}

app.all("/*", async (req, res) => {
    const fileRoute = (ROOT + req.url).replace("//","/");
    const doesExist = fs.existsSync(fileRoute);
    let data = null;
    if (doesExist) {
        data = await handleStaticRoute(fileRoute + "/page.js",req,res);
    } else {
        data = await handleDynamicRoute(fileRoute,req,res);
    }
    
    if (data === false) {
        res.send("no such route!")     
    } else {
        res.send(data);
    }

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})