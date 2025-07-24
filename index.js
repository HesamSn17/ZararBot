import express from 'express'
import { startbot } from './bot.js';
const app=express();
app.listen(3000, ()=>
{
    console.log("run dare mishe 3000");
});
startbot();


