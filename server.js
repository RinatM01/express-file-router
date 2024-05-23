import express from 'express';
import fs, { readFile } from 'node:fs/promises';
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
        console.log(err);
        res.statusCode = 404;
        return false
    }
}

async function handleDynamicRoute (fileRoute, req, res, params) {
    
}

app.all("/*", async (req, res) => {
    const fileRoute = (ROOT + req.url + '/page.js').replace("//","/");
    const data = await handleStaticRoute(fileRoute,req,res);
    if (data === false) {
        res.send("no such route!")
    } else {
        res.send(data);
    }

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})